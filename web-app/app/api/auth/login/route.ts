import { NextRequest } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import { AuthController } from "../../../../controllers/auth.controller";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  return AuthController.login(req);
}
