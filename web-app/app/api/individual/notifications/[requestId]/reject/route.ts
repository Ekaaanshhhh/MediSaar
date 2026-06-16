import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../../middleware/role.middleware";
import { NotificationService } from "../../../../../../services/notification.service";
import connectToDatabase from "../../../../../../lib/mongodb";
import { ApiError } from "../../../../../../lib/apiError";

async function rejectRequestHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    await connectToDatabase();
    
    const userId = req.user!.userId;
    const { requestId } = await params;

    const auditCtx = {
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    await NotificationService.rejectAssociationRequest(userId, requestId, auditCtx);

    return NextResponse.json({
      success: true,
      message: "Association request rejected"
    });
  } catch (error: any) {
    console.error(`POST /api/individual/notifications/reject error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(allowRoles(["INDIVIDUAL"])(rejectRequestHandler));
