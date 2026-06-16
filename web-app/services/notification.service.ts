import mongoose from "mongoose";
import { PatientAssociationRequest } from "../models/PatientAssociationRequest";
import { PatientAssociation } from "../models/PatientAssociation";
import { IndividualProfile } from "../models/IndividualProfile";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { AuditLog } from "../models/AuditLog";
import { ApiError } from "../lib/apiError";

interface AuditContext {
  ip?: string;
  userAgent?: string;
}

export class NotificationService {
  /**
   * Retrieves pending notifications (association requests) for an individual.
   */
  static async getIndividualNotifications(userId: string) {
    const profile = await IndividualProfile.findOne({ userId }).lean();
    if (!profile) {
      throw new ApiError("Individual profile not found", 404);
    }

    const requests = await PatientAssociationRequest.find({
      patientId: profile._id,
      status: "PENDING"
    })
      .populate("institutionId", "institutionName")
      .sort({ createdAt: -1 })
      .lean();

    return requests.map((req: any) => ({
      requestId: req._id.toString(),
      institutionName: req.institutionId?.institutionName || "Unknown Institution",
      status: req.status,
      createdAt: req.createdAt
    }));
  }

  /**
   * Accepts an association request.
   */
  static async acceptAssociationRequest(userId: string, requestId: string, auditCtx: AuditContext) {
    const profile = await IndividualProfile.findOne({ userId }).lean();
    if (!profile) {
      throw new ApiError("Individual profile not found", 404);
    }

    const request = await PatientAssociationRequest.findById(requestId);
    if (!request) {
      throw new ApiError("Request not found", 404);
    }

    if (request.patientId.toString() !== profile._id.toString()) {
      throw new ApiError("Unauthorized to accept this request", 403);
    }

    if (request.status !== "PENDING") {
      throw new ApiError("Request is already processed", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      request.status = "ACCEPTED";
      request.respondedAt = new Date();
      await request.save({ session });

      await PatientAssociation.updateOne(
        { patientId: profile._id, institutionId: request.institutionId },
        { $setOnInsert: { patientId: profile._id, institutionId: request.institutionId } },
        { upsert: true, session }
      );

      await AuditLog.create(
        [
          {
            userId,
            action: "ASSOCIATION_ACCEPTED",
            entityType: "PatientAssociationRequest",
            entityId: request._id,
            metadata: {
              institutionId: request.institutionId,
              ip: auditCtx.ip,
              userAgent: auditCtx.userAgent,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Rejects an association request.
   */
  static async rejectAssociationRequest(userId: string, requestId: string, auditCtx: AuditContext) {
    const profile = await IndividualProfile.findOne({ userId }).lean();
    if (!profile) {
      throw new ApiError("Individual profile not found", 404);
    }

    const request = await PatientAssociationRequest.findById(requestId);
    if (!request) {
      throw new ApiError("Request not found", 404);
    }

    if (request.patientId.toString() !== profile._id.toString()) {
      throw new ApiError("Unauthorized to reject this request", 403);
    }

    if (request.status !== "PENDING") {
      throw new ApiError("Request is already processed", 400);
    }

    request.status = "REJECTED";
    request.respondedAt = new Date();
    await request.save();

    await AuditLog.create({
      userId,
      action: "ASSOCIATION_REJECTED",
      entityType: "PatientAssociationRequest",
      entityId: request._id,
      metadata: {
        institutionId: request.institutionId,
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
      },
    });

    return { success: true };
  }

  /**
   * Institution creates an association request for a patient.
   */
  static async createAssociationRequest(institutionUserId: string, patientMediSaarId: string) {
    const instProfile = await InstitutionProfile.findOne({ userId: institutionUserId }).lean();
    if (!instProfile) {
      throw new ApiError("Institution profile not found", 404);
    }

    const patientProfile = await IndividualProfile.findOne({ mediSaarId: patientMediSaarId }).lean();
    if (!patientProfile) {
      throw new ApiError("Patient not found", 404);
    }

    // Check if already associated
    const existingAssoc = await PatientAssociation.findOne({
      patientId: patientProfile._id,
      institutionId: instProfile._id
    }).lean();

    if (existingAssoc) {
      throw new ApiError("Patient is already associated with this institution", 400);
    }

    // Check if pending request exists
    const pendingReq = await PatientAssociationRequest.findOne({
      patientId: patientProfile._id,
      institutionId: instProfile._id,
      status: "PENDING"
    }).lean();

    if (pendingReq) {
      throw new ApiError("A pending request already exists for this patient", 400);
    }

    const request = await PatientAssociationRequest.create({
      patientId: patientProfile._id,
      institutionId: instProfile._id,
      status: "PENDING",
      message: `${instProfile.institutionName} wants to associate with your MediSaar account.`
    });

    return request;
  }
}
