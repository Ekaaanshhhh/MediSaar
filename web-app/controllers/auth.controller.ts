import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "../services/auth.service";
import { signupSchema, loginSchema } from "../validators/auth.validator";
import { apiErrorResponse } from "../lib/apiError";
import { apiResponse as successResponse } from "../lib/apiResponse";

function getAuditContext(req: NextRequest) {
  return {
    ip: req.headers.get("x-forwarded-for") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  };
}

export class AuthController {
  static async signup(req: NextRequest) {
    try {
      const body = await req.json();
      const payload = signupSchema.parse(body);
      const auditCtx = getAuditContext(req);

      const { user, token } = await AuthService.registerUser(payload, auditCtx);

      const cookieStore = await cookies();
      cookieStore.set(process.env.COOKIE_NAME || "medisaar_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Remove password hash from response
      const { passwordHash, ...safeUser } = (user as any).toObject ? (user as any).toObject() : user;

      return successResponse({ user: safeUser }, "User registered successfully", 201);
    } catch (error) {
      return apiErrorResponse(error, "Failed to register user");
    }
  }

  static async login(req: NextRequest) {
    try {
      const body = await req.json();
      const payload = loginSchema.parse(body);
      const auditCtx = getAuditContext(req);

      const { user, token } = await AuthService.loginUser(payload, auditCtx);

      const cookieStore = await cookies();
      cookieStore.set(process.env.COOKIE_NAME || "medisaar_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      const { passwordHash, ...safeUser } = (user as any).toObject ? (user as any).toObject() : user;

      return successResponse({ user: safeUser }, "Logged in successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to login");
    }
  }

  static async logout(req: NextRequest, userId: string) {
    try {
      const auditCtx = getAuditContext(req);
      await AuthService.logLogout(userId, auditCtx);

      const cookieStore = await cookies();
      cookieStore.delete(process.env.COOKIE_NAME || "medisaar_auth");

      return successResponse(null, "Logged out successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to logout");
    }
  }

  static async getMe(userId: string) {
    try {
      const { user, profile } = await AuthService.getMe(userId);
      return successResponse({ user, profile }, "User retrieved successfully", 200);
    } catch (error) {
      return apiErrorResponse(error, "Failed to retrieve user");
    }
  }
}
