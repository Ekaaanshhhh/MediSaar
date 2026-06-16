import mongoose from "mongoose";
import { DoctorProfile } from "../models/DoctorProfile";
import { User } from "../models/User";
import { DoctorInstitutionInvitation } from "../models/DoctorInstitutionInvitation";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { AuditLog } from "../models/AuditLog";
import { ApiError } from "../lib/apiError";

export class InstitutionDoctorService {
  /**
   * Search for doctors by name or email, excluding those already associated with the institution.
   */
  static async searchDoctors(query: string, institutionUserId: string) {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const institution = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!institution) {
      throw new ApiError("Institution profile not found", 404);
    }

    const searchRegex = new RegExp(query.trim(), "i");

    // 1. Find users matching email or name (with role DOCTOR)
    const users = await User.find({
      role: "DOCTOR",
      $or: [{ email: searchRegex }, { name: searchRegex }],
    }).lean();

    if (users.length === 0) return [];

    const userIds = users.map((u) => u._id);

    // 2. Find doctor profiles for these users, EXCLUDING those already associated with this institution
    const doctors = await DoctorProfile.find({
      userId: { $in: userIds },
      associatedInstitutions: { $ne: institution._id }, // Exclude if already associated
    }).lean();

    // 3. Format the response with rich data
    return doctors.map((doc) => {
      const user = users.find((u) => u._id.toString() === doc.userId.toString());
      return {
        doctorId: doc._id.toString(),
        name: user?.name || "Unknown Doctor",
        email: user?.email || "Unknown Email",
        specialization: doc.specialization,
        yearsOfExperience: doc.yearsOfExperience,
        profilePhoto: doc.profilePhoto || null,
      };
    });
  }

  /**
   * Create a new invitation for a doctor to join the institution.
   */
  static async createInvitation(institutionUserId: string, doctorId: string, message: string) {
    const institution = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!institution) throw new ApiError("Institution profile not found", 404);

    const doctor = await DoctorProfile.findById(doctorId).lean();
    if (!doctor) throw new ApiError("Doctor not found", 404);

    // 1. Block if already associated
    if (doctor.associatedInstitutions && doctor.associatedInstitutions.some((id: any) => id.toString() === institution._id.toString())) {
      throw new ApiError("Doctor is already associated with this institution.", 400);
    }

    // 2. Block duplicate pending invitations
    const existingPending = await DoctorInstitutionInvitation.findOne({
      doctorId: doctor._id,
      institutionId: institution._id,
      status: "PENDING",
    }).lean();

    if (existingPending) {
      throw new ApiError("Invitation already pending.", 400);
    }

    // 3. Create the invitation inside a transaction for audit logging
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [invitation] = await DoctorInstitutionInvitation.create(
        [
          {
            doctorId: doctor._id,
            institutionId: institution._id,
            invitedBy: institutionUserId, // store the user ID who invited
            message: message || `You have been invited to join ${institution.institutionName}.`,
            status: "PENDING",
          },
        ],
        { session }
      );

      // Add audit log
      await AuditLog.create(
        [
          {
            userId: institutionUserId,
            action: "DOCTOR_INVITATION_CREATED",
            entityType: "DoctorInstitutionInvitation",
            entityId: invitation._id,
            metadata: {
              doctorId: doctor._id.toString(),
              institutionId: institution._id.toString(),
              invitationId: invitation._id.toString(),
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return invitation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all active doctors associated with the institution.
   */
  static async getInstitutionDoctors(institutionUserId: string) {
    const institution = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!institution) throw new ApiError("Institution not found", 404);

    const doctors = await DoctorProfile.find({
      associatedInstitutions: institution._id,
    })
      .populate("userId", "name email")
      .lean();

    return doctors.map((doc: any) => ({
      doctorId: doc._id.toString(),
      name: doc.userId?.name || "Unknown",
      email: doc.userId?.email || "Unknown",
      specialization: doc.specialization,
      yearsOfExperience: doc.yearsOfExperience,
      profilePhoto: doc.profilePhoto || null,
      licenseNumber: doc.licenseNumber,
    }));
  }

  /**
   * Get all invitations sent by this institution with analytics.
   */
  static async getInvitations(institutionUserId: string) {
    const institution = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!institution) throw new ApiError("Institution not found", 404);

    const invitations = await DoctorInstitutionInvitation.find({
      institutionId: institution._id,
    })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const analytics = {
      pending: 0,
      accepted: 0,
      rejected: 0,
    };

    const formattedInvitations = invitations.map((inv: any) => {
      if (inv.status === "PENDING") analytics.pending++;
      else if (inv.status === "ACCEPTED") analytics.accepted++;
      else if (inv.status === "REJECTED") analytics.rejected++;

      return {
        invitationId: inv._id.toString(),
        doctorId: inv.doctorId?._id?.toString() || null,
        doctorName: inv.doctorId?.userId?.name || "Unknown Doctor",
        doctorEmail: inv.doctorId?.userId?.email || "Unknown Email",
        specialization: inv.doctorId?.specialization || "Unknown",
        status: inv.status,
        message: inv.message,
        createdAt: inv.createdAt,
        respondedAt: inv.respondedAt || null,
      };
    });

    return {
      analytics,
      invitations: formattedInvitations,
    };
  }
}
