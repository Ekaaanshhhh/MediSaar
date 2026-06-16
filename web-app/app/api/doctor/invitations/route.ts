import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { DoctorInvitationController } from "../../../../controllers/doctorInvitation.controller";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function getInvitationsHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    const data = await DoctorInvitationController.getInvitations(req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/doctor/invitations error:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const GET = withAuth(allowRoles(["DOCTOR"])(getInvitationsHandler));
