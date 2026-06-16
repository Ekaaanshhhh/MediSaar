import connectToDatabase from "../../../../lib/mongodb";
import { InstitutionService } from "../../../../services/institution.service";
import { apiResponse } from "../../../../lib/apiResponse";
import { apiErrorResponse } from "../../../../lib/apiError";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";

async function uploadDocumentHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { patientId, documentCategory, subCategory, cloudinaryUrl, title } = body;

    if (!patientId || !cloudinaryUrl || !documentCategory) {
      return apiResponse(null, "Missing required fields", 400);
    }

    const report = await InstitutionService.uploadPatientDocument(req.user.userId, {
      patientId,
      documentCategory,
      subCategory,
      cloudinaryUrl,
      title
    });
    
    return apiResponse(report, "Document uploaded successfully", 201);
  } catch (error) {
    return apiErrorResponse(error, "Failed to upload document");
  }
}

export const POST = withAuth(allowRoles(["INSTITUTION"])(uploadDocumentHandler));
