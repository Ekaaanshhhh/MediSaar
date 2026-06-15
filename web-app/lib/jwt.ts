import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET environment variable is missing.");
  }
  return JWT_SECRET;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
