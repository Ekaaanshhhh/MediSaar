import { NextRequest } from "next/server";
import connectToDatabase from "../../../../../lib/mongodb";
import { IndividualController } from "../../../../../controllers/individual.controller";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";

async function getInstitutionHistoryHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ institutionId: string }> }
) {
  const { institutionId } = await params;
  await connectToDatabase();
  return IndividualController.getInstitutionHistory(req, institutionId);
}

// Apply the withAuth middleware to protect this route and restrict to INDIVIDUAL
export const GET = withAuth(
  allowRoles(["INDIVIDUAL"])(getInstitutionHistoryHandler)
);
