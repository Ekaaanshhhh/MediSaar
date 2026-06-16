import mongoose from "mongoose";
import { DoctorInstitutionInvitation } from "../models/DoctorInstitutionInvitation";
import { DoctorProfile } from "../models/DoctorProfile";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { AuditLog } from "../models/AuditLog";
import { ApiError } from "../lib/apiError";
import { DoctorInvitationResponse } from "../types/doctorInvitation.types";

interface AuditContext {
  ip?: string;
  userAgent?: string;
}

export class DoctorInvitationService {
  static async getPendingCount(userId: string): Promise<number> {
    const profile = await DoctorProfile.findOne({ userId }).lean();
    if (!profile) return 0;

    return await DoctorInstitutionInvitation.countDocuments({
      doctorId: profile._id,
      status: "PENDING"
    });
  }

  static async getInvitations(userId: string): Promise<DoctorInvitationResponse[]> {
    const profile = await DoctorProfile.findOne({ userId }).lean();
    if (!profile) throw new ApiError("Doctor profile not found", 404);

    const invitations = await DoctorInstitutionInvitation.find({ doctorId: profile._id })
      .populate("institutionId", "institutionName type profilePhoto")
      .sort({ createdAt: -1 })
      .lean();

    return invitations.map((inv: any) => ({
      invitationId: inv._id.toString(),
      institution: {
        id: inv.institutionId?._id?.toString() || "",
        name: inv.institutionId?.institutionName || "Unknown Institution",
        type: inv.institutionId?.type || "HOSPITAL",
        logo: inv.institutionId?.profilePhoto || null,
      },
      message: inv.message,
      specializationRequested: inv.specializationRequested,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : undefined,
    }));
  }

  static async acceptInvitation(userId: string, invitationId: string, auditCtx: AuditContext) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const profile = await DoctorProfile.findOne({ userId }).session(session);
      if (!profile) throw new ApiError("Doctor profile not found", 404);

      const invitation = await DoctorInstitutionInvitation.findById(invitationId)
        .populate("institutionId", "institutionName")
        .session(session);
        
      if (!invitation) throw new ApiError("Invitation not found", 404);

      // Verify Ownership
      if (invitation.doctorId.toString() !== profile._id.toString()) {
        throw new ApiError("Unauthorized to accept this invitation", 403);
      }

      if (invitation.status !== "PENDING") {
        throw new ApiError(`Invitation is already ${invitation.status}`, 400);
      }

      // Check expiry
      if (invitation.expiresAt && new Date() > invitation.expiresAt) {
        throw new ApiError("Invitation has expired", 400);
      }

      invitation.status = "ACCEPTED";
      invitation.respondedAt = new Date();
      await invitation.save({ session });

      // Add to associatedInstitutions safely using $addToSet
      await DoctorProfile.updateOne(
        { _id: profile._id },
        { $addToSet: { associatedInstitutions: invitation.institutionId._id } },
        { session }
      );

      await AuditLog.create([{
        userId,
        action: "DOCTOR_INVITATION_ACCEPTED",
        entityType: "DoctorInstitutionInvitation",
        entityId: invitation._id,
        metadata: {
          doctorId: profile._id.toString(),
          institutionId: invitation.institutionId._id.toString(),
          invitationId: invitation._id.toString(),
          ip: auditCtx.ip,
          userAgent: auditCtx.userAgent,
        }
      }], { session });

      await session.commitTransaction();

      return {
        success: true,
        message: "Invitation accepted successfully",
        data: {
          institutionId: invitation.institutionId._id.toString(),
          institutionName: (invitation.institutionId as any).institutionName,
          status: "ACCEPTED"
        }
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async rejectInvitation(userId: string, invitationId: string, auditCtx: AuditContext) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const profile = await DoctorProfile.findOne({ userId }).session(session);
      if (!profile) throw new ApiError("Doctor profile not found", 404);

      const invitation = await DoctorInstitutionInvitation.findById(invitationId)
        .populate("institutionId", "institutionName")
        .session(session);
        
      if (!invitation) throw new ApiError("Invitation not found", 404);

      // Verify Ownership
      if (invitation.doctorId.toString() !== profile._id.toString()) {
        throw new ApiError("Unauthorized to reject this invitation", 403);
      }

      if (invitation.status !== "PENDING") {
        throw new ApiError(`Invitation is already ${invitation.status}`, 400);
      }

      invitation.status = "REJECTED";
      invitation.respondedAt = new Date();
      await invitation.save({ session });

      await AuditLog.create([{
        userId,
        action: "DOCTOR_INVITATION_REJECTED",
        entityType: "DoctorInstitutionInvitation",
        entityId: invitation._id,
        metadata: {
          doctorId: profile._id.toString(),
          institutionId: invitation.institutionId._id.toString(),
          invitationId: invitation._id.toString(),
          ip: auditCtx.ip,
          userAgent: auditCtx.userAgent,
        }
      }], { session });

      await session.commitTransaction();

      return {
        success: true,
        message: "Invitation rejected",
        data: {
          institutionId: invitation.institutionId._id.toString(),
          institutionName: (invitation.institutionId as any).institutionName,
          status: "REJECTED"
        }
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
