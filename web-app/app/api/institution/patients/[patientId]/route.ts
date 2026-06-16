import connectToDatabase from "../../../../../lib/mongodb";
import { InstitutionService } from "../../../../../services/institution.service";
import { apiResponse } from "../../../../../lib/apiResponse";
import { apiErrorResponse } from "../../../../../lib/apiError";
import { withAuth, AuthenticatedRequest } from "../../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../../middleware/role.middleware";

async function getPatientHandler(req: AuthenticatedRequest, { params }: { params: { patientId: string } }) {
  try {
    await connectToDatabase();
    
    // Await params to resolve the Next.js 16.2.7 promise-based params warning
    const resolvedParams = await Promise.resolve(params);
    const { patientId } = resolvedParams;

    const patient = await InstitutionService.getPatientById(req.user.userId, patientId);
    
    return apiResponse(patient, "Patient fetched successfully", 200);
  } catch (error) {
    return apiErrorResponse(error, "Failed to fetch patient");
  }
}

export const GET = withAuth(allowRoles(["INSTITUTION"])(getPatientHandler));
