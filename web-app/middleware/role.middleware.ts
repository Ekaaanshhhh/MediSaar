import { NextResponse } from "next/server";
import { AuthenticatedRequest } from "./auth.middleware";

type RouteHandler = (req: AuthenticatedRequest, context: unknown) => Promise<NextResponse> | NextResponse;

/**
 * Higher-Order Function to enforce Role-Based Access Control (RBAC).
 * MUST be used AFTER `withAuth` in the chain, so `req.user` is populated.
 */
export function allowRoles(roles: string[]) {
  return function (handler: RouteHandler) {
    return async (req: AuthenticatedRequest, context: unknown) => {
      try {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
          return NextResponse.json(
            { success: false, message: "Forbidden - Insufficient permissions" },
            { status: 403 }
          );
        }

        return await handler(req, context);
      } catch (error) {
        console.error("Role Middleware Error:", error);
        return NextResponse.json(
          { success: false, message: "Internal Server Error during role verification" },
          { status: 500 }
        );
      }
    };
  };
}
