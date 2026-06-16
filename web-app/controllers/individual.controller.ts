import { NextRequest } from "next/server";
import { IndividualService } from "../services/individual.service";
import { apiResponse } from "../lib/apiResponse";
import { apiErrorResponse } from "../lib/apiError";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class IndividualController {
  static async getInstitutions(req: AuthenticatedRequest) {
    try {
      const result = await IndividualService.getInstitutions(req.user.userId);
      return apiResponse(result, "Institutions retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to retrieve institutions");
    }
  }

  static async getInstitutionHistory(req: AuthenticatedRequest, institutionId: string) {
    try {
      const result = await IndividualService.getInstitutionHistory(req.user.userId, institutionId);
      return apiResponse(result, "Institution history retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to retrieve institution history");
    }
  }
}
