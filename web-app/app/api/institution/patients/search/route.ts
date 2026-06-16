import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";
import { InstitutionController } from "../../../../../controllers/institution.controller";
import connectToDatabase from "../../../../../lib/mongodb";

async function searchPatientHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return InstitutionController.searchPatient(req, req.user.userId);
}

export const GET = withAuth(allowRoles(["INSTITUTION"])(searchPatientHandler));
