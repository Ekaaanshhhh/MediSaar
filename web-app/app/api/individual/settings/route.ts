import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { IndividualService } from "../../../../services/individual.service";
import { UserRole } from "../../../../types/user.types";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function getSettingsHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    const userId = req.user!.userId;
    
    const settings = await IndividualService.getSettings(userId);

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error("GET /api/individual/settings error:", error);
    
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

async function updateSettingsHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    const userId = req.user!.userId;
    const body = await req.json();
    
    const result = await IndividualService.updateSettings(userId, body);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("PUT /api/individual/settings error:", error);
    
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

export const GET = withAuth(allowRoles([UserRole.INDIVIDUAL])(getSettingsHandler));
export const PUT = withAuth(allowRoles([UserRole.INDIVIDUAL])(updateSettingsHandler));
