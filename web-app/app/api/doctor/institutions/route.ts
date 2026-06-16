import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { DoctorController } from "../../../../controllers/doctor.controller";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function getInstitutionsHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    const data = await DoctorController.getInstitutions(req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/doctor/institutions error:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const GET = withAuth(allowRoles(["DOCTOR"])(getInstitutionsHandler));
