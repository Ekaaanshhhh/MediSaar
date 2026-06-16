import connectToDatabase from "../../../../lib/mongodb";
import { InstitutionDoctorController } from "../../../../controllers/institutionDoctor.controller";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";

async function getInvitationsHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return InstitutionDoctorController.getInvitations(req);
}

async function createInvitationHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return InstitutionDoctorController.createInvitation(req);
}

export const GET = withAuth(allowRoles(["INSTITUTION"])(getInvitationsHandler));
export const POST = withAuth(allowRoles(["INSTITUTION"])(createInvitationHandler));
