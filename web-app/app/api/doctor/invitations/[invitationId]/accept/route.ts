import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../../middleware/role.middleware";
import { DoctorInvitationController } from "../../../../../../controllers/doctorInvitation.controller";
import connectToDatabase from "../../../../../../lib/mongodb";
import { ApiError } from "../../../../../../lib/apiError";

async function acceptHandler(req: AuthenticatedRequest, { params }: { params: Promise<{ invitationId: string }> }) {
  const resolvedParams = await params;
  try {
    await connectToDatabase();
    const response = await DoctorInvitationController.acceptInvitation(req, resolvedParams.invitationId);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`POST /api/doctor/invitations/${resolvedParams.invitationId}/accept error:`, error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const POST = withAuth(allowRoles(["DOCTOR"])(acceptHandler));
