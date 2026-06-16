import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User";
import { IndividualProfile } from "../models/IndividualProfile";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { Visit } from "../models/Visit";
import { AuditLog } from "../models/AuditLog";
import { PatientAssociationRequest } from "../models/PatientAssociationRequest";
import { PatientAssociation } from "../models/PatientAssociation";
import { generateMediSaarId } from "../utils/generateMediSaarId";
import { ApiError } from "../lib/apiError";
import { AddPatientPayload } from "../validators/patient.validator";
import { UserRole, UserStatus } from "../types/user.types";
import { VisitStatus } from "../types/visit.types";

interface AuditContext {
  ip?: string;
  userAgent?: string;
}

function generateTemporaryPassword(): string {
  // Generates a simple secure random password, e.g. 'A1b2C3d4@'
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  // Ensure it has at least one upper, lower, number (though for MVP, random is fine)
  return password;
}

export class InstitutionService {
  static async addPatient(
    payload: AddPatientPayload,
    creatorId: string,
    auditCtx: AuditContext
  ) {
    // 1. Duplicate Email Check Before Transaction
    const existingUser = await User.findOne({ email: payload.email }).lean();
    if (existingUser) {
      throw new ApiError("Patient already exists", 400);
    }

    // 2. Find the Institution Profile of the creator
    const institutionProfile = await InstitutionProfile.findOne({ userId: creatorId }).lean();
    if (!institutionProfile) {
      throw new ApiError("Creator institution profile not found", 404);
    }

    const institutionId = institutionProfile._id;

    // 3. Generate Temporary Password
    const temporaryPassword = generateTemporaryPassword();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. Create Base User
      const [user] = await User.create(
        [
          {
            name: payload.name,
            email: payload.email,
            passwordHash,
            role: UserRole.INDIVIDUAL,
            status: UserStatus.ACTIVE,
            mustChangePassword: true,
          },
        ],
        { session }
      );

      // 5. Generate MediSaar ID and Create Profile
      const mediSaarId = await generateMediSaarId();
      const [profile] = await IndividualProfile.create(
        [
          {
            userId: user._id,
            mediSaarId,
            dateOfBirth: new Date(payload.dateOfBirth),
            gender: payload.gender,
            bloodGroup: payload.bloodGroup,
            allergies: payload.allergies || [],
            emergencyContact: payload.emergencyContact,
          },
        ],
        { session }
      );

      // Link Profile to User
      user.profileId = profile._id as mongoose.Types.ObjectId;
      await user.save({ session });

      // 6. Create Patient Association Request (Pending)
      await PatientAssociationRequest.create(
        [
          {
            patientId: profile._id,
            institutionId,
            status: "PENDING",
            message: `${institutionProfile.institutionName} wants to associate with your MediSaar account.`,
          },
        ],
        { session }
      );

      // 7. Create Audit Log
      await AuditLog.create(
        [
          {
            userId: creatorId,
            action: "PATIENT_REGISTERED",
            entityType: "IndividualProfile",
            entityId: profile._id,
            metadata: {
              institutionId,
              patientId: profile._id,
              ip: auditCtx.ip,
              userAgent: auditCtx.userAgent,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        mediSaarId,
        patientId: profile._id.toString(),
        temporaryPassword,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async searchPatient(creatorId: string, q: string) {
    const institutionProfile = await InstitutionProfile.findOne({ userId: creatorId }).lean();
    if (!institutionProfile) {
      throw new ApiError("Institution profile not found", 404);
    }

    if (!q || q.trim().length < 3) {
      throw new ApiError("Search query too short", 400);
    }

    const searchQuery = q.trim();
    // Allow partial matches but limit results
    const searchRegex = new RegExp(searchQuery, 'i');

    const users = await User.find({ email: searchRegex, role: UserRole.INDIVIDUAL }).lean();
    const userIds = users.map(u => u._id);

    const profiles = await IndividualProfile.find({
      $or: [
        { mediSaarId: searchRegex },
        { userId: { $in: userIds } }
      ]
    }).populate("userId", "name email").lean();

    if (!profiles.length) {
      return null;
    }

    // Return the first match for exact-ish searches, or just map them
    // The requirement says return a single object or list? 
    // "Return: { patientId, name... }" -> I will just return a single patient or array. 
    // Since search usually returns one or multiple, let's return an array to be safe,
    // actually the plan implies single object in the UI card. I'll return an array and let frontend handle it.
    return profiles.map((profile: any) => ({
      patientId: profile._id.toString(),
      name: profile.userId.name,
      email: profile.userId.email,
      mediSaarId: profile.mediSaarId,
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
      bloodGroup: profile.bloodGroup || null
    }));
  }

  static async addExistingPatient(
    patientId: string,
    creatorId: string,
    auditCtx: AuditContext
  ) {
    const institutionProfile = await InstitutionProfile.findOne({ userId: creatorId }).lean();
    if (!institutionProfile) {
      throw new ApiError("Creator institution profile not found", 404);
    }

    const institutionId = institutionProfile._id;

    const profile = await IndividualProfile.findById(patientId).lean();
    if (!profile) {
      throw new ApiError("Patient not found", 404);
    }

    // 1. Verify that Patient <-> Institution relationship does not already exist
    const existingAssociation = await PatientAssociation.findOne({
      patientId: profile._id,
      institutionId
    }).lean();

    if (existingAssociation) {
      throw new ApiError("Patient already associated with this institution", 400);
    }

    // 2. Prevent Duplicate Pending Requests
    const existingRequest = await PatientAssociationRequest.findOne({
      patientId: profile._id,
      institutionId,
      status: "PENDING"
    }).lean();

    if (existingRequest) {
      throw new ApiError("Association request already pending", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [request] = await PatientAssociationRequest.create(
        [
          {
            patientId: profile._id,
            institutionId,
            status: "PENDING",
            message: `${institutionProfile.institutionName} wants to associate with your MediSaar account.`
          }
        ],
        { session }
      );

      await AuditLog.create(
        [
          {
            userId: creatorId,
            action: "PATIENT_ASSOCIATION_REQUEST_CREATED",
            entityType: "PatientAssociationRequest",
            entityId: request._id,
            metadata: {
              patientId: profile._id.toString(),
              institutionId: institutionId.toString(),
              requestId: request._id.toString(),
              ip: auditCtx.ip,
              userAgent: auditCtx.userAgent,
            }
          }
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        message: "Association request sent successfully"
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getPatientById(institutionUserId: string, patientId: string) {
    const institution = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!institution) {
      throw new ApiError("Institution not found", 404);
    }

    const patient = await IndividualProfile.findById(patientId).populate("userId", "name email").lean();
    if (!patient) {
      throw new ApiError("Patient not found", 404);
    }

    return {
      patientId: patient._id.toString(),
      name: (patient.userId as any)?.name || "Unknown",
      email: (patient.userId as any)?.email || "Unknown",
      mediSaarId: patient.mediSaarId,
      dob: patient.dob,
      bloodGroup: patient.bloodGroup,
    };
  }

  static async uploadPatientDocument(institutionUserId: string, payload: any) {
    const { patientId, documentCategory, subCategory, cloudinaryUrl, title } = payload;
    
    const institution = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!institution) throw new ApiError("Institution not found", 404);

    const patient = await IndividualProfile.findById(patientId).lean();
    if (!patient) throw new ApiError("Patient not found", 404);

    // Map subCategory to ReportType or default to LAB_REPORT/PRESCRIPTION_SCAN
    let reportType = "OTHER";
    if (documentCategory === "Prescription") {
      reportType = "PRESCRIPTION_SCAN";
    } else if (documentCategory === "Report") {
      const typeMap: Record<string, string> = {
        "Blood Test": "BLOOD_REPORT",
        "X-Ray": "XRAY",
        "MRI Scan": "MRI",
        "CT Scan": "CT_SCAN",
        "Ultrasound": "LAB_REPORT", // Or map accordingly
        "ECG": "LAB_REPORT",
        "Pathology": "LAB_REPORT",
      };
      reportType = typeMap[subCategory] || "LAB_REPORT";
    }

    const { Report } = await import("../models/Report");

    const report = await Report.create({
      patientId: patient._id,
      uploadedBy: institutionUserId, // The User ID uploading
      reportType: reportType,
      title: title || `${documentCategory} - ${subCategory || "Uploaded"}`,
      cloudinaryUrl: cloudinaryUrl,
      reportDate: new Date(),
      createdBy: institutionUserId,
      updatedBy: institutionUserId,
    });

    return report;
  }

  static async getPatients(creatorId: string, page: number = 1, limit: number = 10, searchQ: string = '') {
    const institutionProfile = await InstitutionProfile.findOne({ userId: creatorId }).lean();
    if (!institutionProfile) {
      throw new ApiError("Institution profile not found", 404);
    }

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { institutionId: institutionProfile._id, isDeleted: { $ne: true } } },
      { $sort: { visitDate: -1 } },
      {
        $group: {
          _id: "$patientId",
          totalVisits: { $sum: 1 },
          lastVisitDate: { $first: "$visitDate" },
          latestVisitStatus: { $first: "$status" },
          latestDoctorId: { $first: "$doctorId" }
        }
      },
      {
        $lookup: {
          from: "individualprofiles",
          localField: "_id",
          foreignField: "_id",
          as: "profile"
        }
      },
      { $unwind: "$profile" },
      {
        $lookup: {
          from: "users",
          localField: "profile.userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "latestDoctorId",
          foreignField: "_id",
          as: "doctorProfile"
        }
      },
      {
        $unwind: { path: "$doctorProfile", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "users",
          localField: "doctorProfile.userId",
          foreignField: "_id",
          as: "doctorUser"
        }
      },
      {
        $unwind: { path: "$doctorUser", preserveNullAndEmptyArrays: true }
      }
    ];

    if (searchQ) {
      const searchRegex = new RegExp(searchQ, 'i');
      pipeline.push({
        $match: {
          $or: [
            { "user.name": searchRegex },
            { "user.email": searchRegex },
            { "profile.mediSaarId": searchRegex }
          ]
        }
      });
    }

    // Facet for pagination
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $sort: { lastVisitDate: -1 } }, { $skip: skip }, { $limit: limit }]
      }
    });

    const [result] = await Visit.aggregate(pipeline);

    const total = result.metadata[0]?.total || 0;
    const patients = result.data.map((item: any) => ({
      id: item.profile._id.toString(),
      name: item.user.name,
      email: item.user.email,
      medisaarId: item.profile.mediSaarId,
      lastVisit: item.lastVisitDate,
      totalVisits: item.totalVisits,
      registrationDate: item.profile.createdAt,
      assignedDoctor: item.doctorUser ? `Dr. ${item.doctorUser.name.replace('Dr. ', '')}` : null,
      status: item.latestVisitStatus
    }));

    return { patients, total, page, limit };
  }
}
