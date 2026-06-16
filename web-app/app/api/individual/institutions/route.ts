import { NextRequest } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import { IndividualController } from "../../../../controllers/individual.controller";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";

async function getInstitutionsHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return IndividualController.getInstitutions(req);
}

// Apply the withAuth middleware to protect this route and restrict to INDIVIDUAL
export const GET = withAuth(
  allowRoles(["INDIVIDUAL"])(getInstitutionsHandler)
);
