import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, JwtPayload } from "../lib/jwt";
import { ApiError, apiErrorResponse } from "../lib/apiError";

// Extend NextRequest to include our custom user property
export interface AuthenticatedRequest extends NextRequest {
  user: JwtPayload;
}

type RouteHandler = (req: AuthenticatedRequest, context: any) => Promise<NextResponse> | NextResponse;

/**
 * Higher-Order Function to protect API Route Handlers.
 * Extracts the JWT from cookies, verifies it, and attaches the payload to `req.user`.
 */
export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(process.env.COOKIE_NAME || "medisaar_auth")?.value;

      if (!token) {
        return apiErrorResponse(new ApiError("Unauthorized", 401));
      }

      const payload = verifyToken(token);

      // Attach user context
      (req as AuthenticatedRequest).user = payload;

      return await handler(req as AuthenticatedRequest, context);
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      // Handles Invalid Token and Expired Token cases
      return apiErrorResponse(new ApiError("Unauthorized", 401));
    }
  };
}
