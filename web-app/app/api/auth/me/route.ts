import connectToDatabase from "../../../../lib/mongodb";
import { AuthController } from "../../../../controllers/auth.controller";
import { withAuth, AuthenticatedRequest } from "../../../../middleware/auth.middleware";

async function getMeHandler(req: AuthenticatedRequest) {
  await connectToDatabase();
  return AuthController.getMe(req.user.userId);
}

// Apply the withAuth middleware to protect this route
export const GET = withAuth(getMeHandler);
