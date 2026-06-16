import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { DoctorService } from "../services/doctor.service";
import { ApiError } from "../lib/apiError";

export class DoctorController {
  static async searchPatients(req: AuthenticatedRequest) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    return await DoctorService.searchPatients(page, limit, q);
  }

  static async getPatientDetails(req: AuthenticatedRequest, patientId: string) {
    return await DoctorService.getPatientDetails(patientId);
  }

  static async getInstitutions(req: AuthenticatedRequest) {
    const userId = req.user!.userId;
    return await DoctorService.getAssociatedInstitutions(userId);
  }

  static async getSettings(req: AuthenticatedRequest) {
    const userId = req.user!.userId;
    return await DoctorService.getSettings(userId);
  }

  static async updateSettings(req: AuthenticatedRequest) {
    const userId = req.user!.userId;
    const body = await req.json();

    const auditCtx = {
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    return await DoctorService.updateSettings(userId, body, auditCtx);
  }

  static async changePassword(req: AuthenticatedRequest) {
    const userId = req.user!.userId;
    const body = await req.json();

    const auditCtx = {
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    return await DoctorService.changePassword(userId, body, auditCtx);
  }
}
