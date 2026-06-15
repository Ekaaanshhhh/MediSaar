import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function apiErrorResponse(
  error: unknown,
  defaultMessage: string = "Internal Server Error",
  defaultStatus: number = 500
): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors seamlessly
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation Error",
        errors: error.issues,
      },
      { status: 400 }
    );
  }

  console.error("🔥 Server Error:", error);

  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : defaultMessage,
    },
    { status: defaultStatus }
  );
}
