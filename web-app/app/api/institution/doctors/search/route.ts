import connectToDatabase from "../../../../../lib/mongodb";
import { InstitutionDoctorController } from "../../../../../controllers/institutionDoctor.controller";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";

async function searchDoctorsHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return InstitutionDoctorController.searchDoctors(req);
}

export const GET = withAuth(allowRoles(["INSTITUTION"])(searchDoctorsHandler));
