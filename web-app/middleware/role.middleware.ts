import { NextResponse } from "next/server";
import { AuthenticatedRequest } from "./auth.middleware";
import { ApiError, apiErrorResponse } from "../lib/apiError";

type RouteHandler = (req: AuthenticatedRequest, context: any) => Promise<NextResponse> | NextResponse;

/**
 * Higher-Order Function to enforce Role-Based Access Control (RBAC).
 * MUST be used AFTER `withAuth` in the chain, so `req.user` is populated.
 */
export function allowRoles(roles: ("INDIVIDUAL" | "DOCTOR" | "INSTITUTION")[]) {
  return function (handler: RouteHandler) {
    return async (req: AuthenticatedRequest, context: any) => {
      try {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole as any)) {
          return apiErrorResponse(new ApiError("Forbidden", 403));
        }

        return await handler(req, context);
      } catch (error) {
        console.error("Role Middleware Error:", error);
        return apiErrorResponse(new ApiError("Internal Server Error", 500));
      }
    };
  };
}
