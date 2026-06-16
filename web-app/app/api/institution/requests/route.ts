import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { NotificationService } from "../../../../services/notification.service";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function createRequestHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { mediSaarId } = body;
    
    if (!mediSaarId) {
      throw new ApiError("Patient MediSaar ID is required", 400);
    }

    const institutionUserId = req.user!.userId;
    const request = await NotificationService.createAssociationRequest(institutionUserId, mediSaarId);

    return NextResponse.json({
      success: true,
      data: request,
      message: "Association request sent successfully"
    });
  } catch (error: any) {
    console.error("POST /api/institution/requests error:", error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(allowRoles(["INSTITUTION"])(createRequestHandler));
