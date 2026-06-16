import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { DoctorInvitationService } from "../services/doctorInvitation.service";

export class DoctorInvitationController {
  static async getInvitations(req: AuthenticatedRequest) {
    const userId = req.user!.userId;
    return await DoctorInvitationService.getInvitations(userId);
  }

  static async getPendingCount(req: AuthenticatedRequest) {
    const userId = req.user!.userId;
    const count = await DoctorInvitationService.getPendingCount(userId);
    return { count };
  }

  static async acceptInvitation(req: AuthenticatedRequest, invitationId: string) {
    const userId = req.user!.userId;
    const auditCtx = {
      ip: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    };
    return await DoctorInvitationService.acceptInvitation(userId, invitationId, auditCtx);
  }

  static async rejectInvitation(req: AuthenticatedRequest, invitationId: string) {
    const userId = req.user!.userId;
    const auditCtx = {
      ip: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    };
    return await DoctorInvitationService.rejectInvitation(userId, invitationId, auditCtx);
  }
}
