import { NextRequest } from "next/server";
import { InstitutionService } from "../services/institution.service";
import { addPatientSchema } from "../validators/patient.validator";
import { apiResponse } from "../lib/apiResponse";
import { apiErrorResponse, ApiError } from "../lib/apiError";

export class InstitutionController {
  static async addPatient(req: NextRequest, userId: string, auditCtx: { ip?: string; userAgent?: string }) {
    try {
      const body = await req.json();

      // Validate payload
      const validatedData = addPatientSchema.parse(body);

      // Call service
      const result = await InstitutionService.addPatient(validatedData, userId, auditCtx);

      return apiResponse(result, "Patient registered successfully", 201);
    } catch (error) {
      console.log("Validation/AddPatient Error:", JSON.stringify(error, null, 2));
      return apiErrorResponse(error);
    }
  }

  static async searchPatient(req: NextRequest, userId: string) {
    try {
      const url = new URL(req.url);
      const q = url.searchParams.get('q') || '';
      
      const result = await InstitutionService.searchPatient(userId, q);
      return apiResponse(result, "Search completed", 200);
    } catch (error) {
      return apiErrorResponse(error);
    }
  }

  static async addExistingPatient(req: NextRequest, userId: string, auditCtx: { ip?: string; userAgent?: string }) {
    try {
      const body = await req.json();
      const { patientId } = body;
      if (!patientId) {
        throw new ApiError("patientId is required", 400);
      }
      
      const result = await InstitutionService.addExistingPatient(patientId, userId, auditCtx);
      return apiResponse(result, "Patient association request sent", 201);
    } catch (error) {
      return apiErrorResponse(error);
    }
  }

  static async getPatients(req: NextRequest, userId: string) {
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const q = url.searchParams.get('q') || '';

      const result = await InstitutionService.getPatients(userId, page, limit, q);

      return apiResponse(result, "Patients retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error);
    }
  }
}
