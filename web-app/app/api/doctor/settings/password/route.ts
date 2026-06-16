import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";
import { DoctorController } from "../../../../../controllers/doctor.controller";
import connectToDatabase from "../../../../../lib/mongodb";
import { ApiError } from "../../../../../lib/apiError";

async function putPasswordHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    await DoctorController.changePassword(req);
    
    // As per user requirement: "Invalidate existing JWT sessions after password change if feasible."
    // In our JWT implementation, changing the password might implicitly invalidate if the secret is tied to the hash.
    // However, if we're using generic cookies, we can explicitly clear the auth cookie to force re-login.
    const response = NextResponse.json({ 
      success: true, 
      message: "Password changed successfully. Please log in again." 
    });
    
    // Clear the auth cookie to enforce logout
    response.cookies.delete("auth-token");
    
    return response;
  } catch (error: any) {
    console.error("PUT /api/doctor/settings/password error:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withAuth(allowRoles(["DOCTOR"])(putPasswordHandler));
