import connectToDatabase from "../../../../lib/mongodb";
import { InstitutionDoctorController } from "../../../../controllers/institutionDoctor.controller";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";

async function getDoctorsHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return InstitutionDoctorController.getInstitutionDoctors(req);
}

export const GET = withAuth(allowRoles(["INSTITUTION"])(getDoctorsHandler));
