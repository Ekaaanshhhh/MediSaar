import { NextResponse } from "next/server";

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export function apiResponse<T>(
  data: T | null,
  message: string = "Success",
  status: number = 200
): NextResponse<ApiResponsePayload<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      ...(data !== null && { data }),
    },
    { status }
  );
}
