import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";
import { AuthService } from "../../../../../services/auth.service";
import { UserRole } from "../../../../../types/user.types";
import connectToDatabase from "../../../../../lib/mongodb";
import { ApiError } from "../../../../../lib/apiError";

async function changePasswordHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      throw new ApiError("Current password and new password are required", 400);
    }
    
    if (newPassword.length < 8) {
      throw new ApiError("New password must be at least 8 characters long", 400);
    }

    const auditCtx = {
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    const userId = req.user!.userId;
    await AuthService.changePassword(userId, { currentPassword, newPassword }, auditCtx);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error: any) {
    console.error("PUT /api/individual/settings/password error:", error);
    
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

export const PUT = withAuth(allowRoles([UserRole.INDIVIDUAL])(changePasswordHandler));
