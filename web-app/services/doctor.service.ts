import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { DoctorProfile } from "../models/DoctorProfile";
import { IndividualProfile } from "../models/IndividualProfile";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { Visit } from "../models/Visit";
import { Diagnosis } from "../models/Diagnosis";
import { Report } from "../models/Report";
import { Prescription } from "../models/Prescription";
import { AuditLog } from "../models/AuditLog";
import { ApiError } from "../lib/apiError";

interface AuditContext {
  ip?: string;
  userAgent?: string;
}

export class DoctorService {
  /**
   * 1. Search Patients (Global)
   */
  static async searchPatients(page: number = 1, limit: number = 10, searchQ: string = '') {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ];

    if (searchQ) {
      const searchRegex = new RegExp(searchQ, 'i');
      pipeline.push({
        $match: {
          $or: [
            { "user.name": searchRegex },
            { "user.email": searchRegex },
            { mediSaarId: searchRegex }
          ]
        }
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }]
      }
    });

    const [result] = await IndividualProfile.aggregate(pipeline);
    const total = result.metadata[0]?.total || 0;
    const profiles = result.data;

    // Enhance each profile with metrics and history
    const patients = await Promise.all(profiles.map(async (p: any) => {
      // Get unique institutions from visits
      const visits = await Visit.find({ patientId: p._id, isDeleted: { $ne: true } })
        .populate("institutionId", "institutionName")
        .sort({ visitDate: -1 })
        .lean();

      const uniqueInstitutionsMap = new Map();
      visits.forEach((v: any) => {
        if (v.institutionId && !uniqueInstitutionsMap.has(v.institutionId._id.toString())) {
          uniqueInstitutionsMap.set(v.institutionId._id.toString(), {
            institutionId: v.institutionId._id,
            institutionName: v.institutionId.institutionName
          });
        }
      });

      const institutions = Array.from(uniqueInstitutionsMap.values());
      const lastVisitDate = visits.length > 0 ? visits[0].visitDate : null;

      // Diagnoses
      const diagnoses = await Diagnosis.find({ patientId: p._id, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .lean();
      
      const recentDiagnoses = diagnoses.slice(0, 3).map((d: any) => d.conditionName);

      // Reports count
      const totalReports = await Report.countDocuments({ patientId: p._id, isDeleted: { $ne: true } });

      return {
        patientId: p._id.toString(),
        name: p.user.name,
        mediSaarId: p.mediSaarId,
        email: p.user.email,
        institutions,
        recentDiagnoses,
        lastVisitDate,
        totalVisits: visits.length,
        totalReports,
        totalDiagnoses: diagnoses.length,
        currentAISummary: p.currentAISummary || null
      };
    }));

    return { patients, total, page, limit };
  }

  /**
   * 1.5 Get Patient Details (Longitudinal Record)
   */
  static async getPatientDetails(patientId: string) {
    const profile = await IndividualProfile.findById(patientId).populate("userId", "name email").lean();
    if (!profile) throw new ApiError("Patient profile not found", 404);

    const user = profile.userId as any;

    // Get Visits with nested doctor name
    const visits = await Visit.find({ patientId, isDeleted: { $ne: true } })
      .populate("institutionId", "institutionName")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" }
      })
      .sort({ visitDate: -1 })
      .lean();

    const formattedVisits = visits.map((v: any) => ({
      id: v._id.toString(),
      date: v.visitDate,
      institution: v.institutionId?.institutionName || "Unknown Institution",
      doctor: v.doctorId?.userId?.name || "Unknown Doctor",
      diagnosis: v.chiefComplaint || "", // Mapped to chiefComplaint as basic diagnosis text
      notes: v.notes || ""
    }));

    // Reports
    const reports = await Report.find({ patientId, isDeleted: { $ne: true } })
      .populate({
        path: "visitId",
        populate: { path: "institutionId", select: "institutionName" }
      })
      .sort({ reportDate: -1 })
      .lean();

    const formattedReports = reports.map((r: any) => ({
      id: r._id.toString(),
      date: r.reportDate,
      type: r.reportType,
      title: r.title,
      institution: r.visitId?.institutionId?.institutionName || "Unknown",
      fileUrl: r.cloudinaryUrl || ""
    }));

    // Prescriptions
    const prescriptions = await Prescription.find({ patientId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();

    const formattedPrescriptions = prescriptions.map((p: any) => ({
      id: p._id.toString(),
      date: p.createdAt,
      medications: (p.medicines || []).map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration
      }))
    }));

    return {
      user: {
        name: user?.name || "Unknown",
        email: user?.email || "Unknown"
      },
      profile: {
        medisaarId: profile.mediSaarId,
        phone: profile.phone || "",
        bloodGroup: profile.bloodGroup || "Unknown",
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender || "Unknown",
        currentAISummary: profile.currentAISummary || null,
        allergies: profile.allergies || [],
        currentConditions: []
      },
      visits: formattedVisits,
      reports: formattedReports,
      prescriptions: formattedPrescriptions
    };
  }

  /**
   * 2. Get Associated Institutions
   */
  static async getAssociatedInstitutions(doctorId: string) {
    const profile = await DoctorProfile.findOne({ userId: doctorId })
      .populate("associatedInstitutions", "institutionName type")
      .lean();

    if (!profile) {
      throw new ApiError("Doctor profile not found", 404);
    }

    const institutions = profile.associatedInstitutions || [];

    const result = await Promise.all(institutions.map(async (inst: any) => {
      // Get visits for this doctor at this institution
      const visits = await Visit.find({
        doctorId: profile._id,
        institutionId: inst._id,
        isDeleted: { $ne: true }
      }).lean();

      const uniquePatients = new Set(visits.map(v => v.patientId.toString()));

      return {
        institution: {
          institutionId: inst._id,
          institutionName: inst.institutionName,
          institutionType: inst.type || "HOSPITAL"
        },
        stats: {
          totalPatientsSeen: uniquePatients.size,
          totalVisits: visits.length
        }
      };
    }));

    return result;
  }

  /**
   * 3. Get Doctor Settings
   */
  static async getSettings(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw new ApiError("User not found", 404);

    const profile = await DoctorProfile.findOne({ userId }).lean();
    if (!profile) throw new ApiError("Doctor profile not found", 404);

    return {
      name: user.name,
      email: user.email,
      specialization: profile.specialization,
      qualification: profile.qualification,
      yearsOfExperience: profile.yearsOfExperience,
      profilePhoto: profile.profilePhoto || null
    };
  }

  /**
   * 4. Update Doctor Settings
   */
  static async updateSettings(userId: string, payload: any, auditCtx: AuditContext) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new ApiError("User not found", 404);

      const profile = await DoctorProfile.findOne({ userId }).session(session);
      if (!profile) throw new ApiError("Doctor profile not found", 404);

      const changedFields: string[] = [];

      if (payload.name && payload.name !== user.name) {
        user.name = payload.name;
        changedFields.push("name");
      }

      const profileFields = ["specialization", "qualification", "yearsOfExperience", "profilePhoto"];
      for (const field of profileFields) {
        if (payload[field] !== undefined && payload[field] !== (profile as any)[field]) {
          (profile as any)[field] = payload[field];
          changedFields.push(field);
        }
      }

      if (changedFields.length > 0) {
        await user.save({ session });
        await profile.save({ session });

        await AuditLog.create(
          [
            {
              userId,
              action: "DOCTOR_PROFILE_UPDATED",
              entityType: "DoctorProfile",
              entityId: profile._id,
              metadata: {
                changedFields,
                ip: auditCtx.ip,
                userAgent: auditCtx.userAgent,
              },
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      return { success: true, changedFields };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * 5. Change Doctor Password
   */
  static async changePassword(userId: string, payload: any, auditCtx: AuditContext) {
    const { currentPassword, newPassword, confirmPassword } = payload;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ApiError("All password fields are required", 400);
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError("New password and confirm password do not match", 400);
    }

    if (currentPassword === newPassword) {
      throw new ApiError("New password must be different from current password", 400);
    }

    // Password rules: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new ApiError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number", 400);
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ApiError("Incorrect current password", 401);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await AuditLog.create({
      userId,
      action: "DOCTOR_PASSWORD_CHANGED",
      entityType: "User",
      entityId: user._id,
      metadata: {
        changedFields: ["passwordHash"],
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
      },
    });

    return { success: true };
  }
}
