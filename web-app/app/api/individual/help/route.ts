import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { IndividualService } from "../../../../services/individual.service";
import { UserRole } from "../../../../types/user.types";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function submitHelpHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    const userId = req.user!.userId;
    const body = await req.json();
    
    const ticket = await IndividualService.submitSupportTicket(userId, body);

    return NextResponse.json({
      success: true,
      data: ticket
    });
  } catch (error: any) {
    console.error("POST /api/individual/help error:", error);
    
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

export const POST = withAuth(allowRoles([UserRole.INDIVIDUAL])(submitHelpHandler));
