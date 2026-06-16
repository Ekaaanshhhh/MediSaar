import { NextRequest } from "next/server";
import { InstitutionDoctorService } from "../services/institutionDoctor.service";
import { apiResponse } from "../lib/apiResponse";
import { apiErrorResponse } from "../lib/apiError";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class InstitutionDoctorController {
  static async searchDoctors(req: AuthenticatedRequest) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q") || "";
      const result = await InstitutionDoctorService.searchDoctors(query, req.user.userId);
      return apiResponse(result, "Doctors retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to search doctors");
    }
  }

  static async getInstitutionDoctors(req: AuthenticatedRequest) {
    try {
      const result = await InstitutionDoctorService.getInstitutionDoctors(req.user.userId);
      return apiResponse(result, "Active doctors retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to fetch active doctors");
    }
  }

  static async getInvitations(req: AuthenticatedRequest) {
    try {
      const result = await InstitutionDoctorService.getInvitations(req.user.userId);
      return apiResponse(result, "Invitations retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to fetch invitations");
    }
  }

  static async createInvitation(req: AuthenticatedRequest) {
    try {
      const body = await req.json();
      const { doctorId, message } = body;

      if (!doctorId) {
        return apiResponse(null, "Doctor ID is required", 400);
      }

      const result = await InstitutionDoctorService.createInvitation(
        req.user.userId,
        doctorId,
        message
      );
      
      return apiResponse(result, "Invitation sent successfully", 201);
    } catch (error: any) {
      return apiErrorResponse(error, error.message || "Failed to create invitation");
    }
  }
}
