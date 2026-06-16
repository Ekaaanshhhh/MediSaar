import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";
import { allowRoles } from "../../../../middleware/role.middleware";
import { IndividualService } from "../../../../services/individual.service";
import connectToDatabase from "../../../../lib/mongodb";
import { ApiError } from "../../../../lib/apiError";

async function getDashboardHandler(req: AuthenticatedRequest) {
  try {
    await connectToDatabase();
    const userId = req.user!.userId;
    
    const dashboardData = await IndividualService.getDashboardData(userId);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    console.error("GET /api/individual/dashboard error:", error);
    
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

export const GET = withAuth(allowRoles(["INDIVIDUAL"])(getDashboardHandler));
