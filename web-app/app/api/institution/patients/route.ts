import connectToDatabase from "../../../../lib/mongodb";
import { InstitutionController } from "../../../../controllers/institution.controller";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";

async function addPatientHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  return InstitutionController.addPatient(req, req.user.userId, { ip, userAgent });
}

async function getPatientsHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  
  return InstitutionController.getPatients(req, req.user.userId);
}

// Protect route: Only logged in users with role 'INSTITUTION'
export const POST = withAuth(allowRoles(["INSTITUTION"])(addPatientHandler));
export const GET = withAuth(allowRoles(["INSTITUTION"])(getPatientsHandler));
