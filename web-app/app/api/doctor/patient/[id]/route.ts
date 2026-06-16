import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";
import { DoctorController } from "../../../../../controllers/doctor.controller";
import connectToDatabase from "../../../../../lib/mongodb";
import { ApiError } from "../../../../../lib/apiError";

async function getPatientHandler(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    await connectToDatabase();
    const data = await DoctorController.getPatientDetails(req, resolvedParams.id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`GET /api/doctor/patient/${resolvedParams.id} error:`, error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const GET = withAuth(allowRoles(["DOCTOR"])(getPatientHandler));
