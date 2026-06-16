import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";
import { InstitutionController } from "../../../../../controllers/institution.controller";
import connectToDatabase from "../../../../../lib/mongodb";

async function addExistingPatientHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  return InstitutionController.addExistingPatient(req, req.user.userId, { ip, userAgent });
}

export const POST = withAuth(allowRoles(["INSTITUTION"])(addExistingPatientHandler));
