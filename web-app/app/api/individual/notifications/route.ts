import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { NotificationService } from "../../../../services/notification.service";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function getNotificationsHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    
    const userId = req.user!.userId;
    const notifications = await NotificationService.getIndividualNotifications(userId);

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error("GET /api/individual/notifications error:", error);
    
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

export const GET = withAuth(allowRoles(["INDIVIDUAL"])(getNotificationsHandler));
