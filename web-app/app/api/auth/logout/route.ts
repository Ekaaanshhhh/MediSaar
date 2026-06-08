import connectToDatabase from "../../../../lib/mongodb";
import { AuthController } from "../../../../controllers/auth.controller";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";

async function logoutHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return AuthController.logout(req, req.user.userId);
}

// Apply the withAuth middleware to protect this route
export const POST = withAuth(logoutHandler);
