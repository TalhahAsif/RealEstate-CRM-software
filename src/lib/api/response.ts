import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/** Standard success response. */
export function SuccessResponse(
  resource: string = "data",
  status: number = 200,
  data: unknown = [],
) {
  return NextResponse.json<ApiResponse>(
    {
      success: true,
      message: `${resource} fetched successfully`,
      data,
      status,
    },
    { status },
  );
}

/** Standard "not found" response. */
export function NotFoundResponse(
  message: string = "Data not found",
  status: number = 404,
  data: unknown = [],
) {
  return NextResponse.json<ApiResponse>(
    { success: false, message, data, status },
    { status },
  );
}

/** Standard error response (defaults to 501 for endpoints not implemented yet). */
export function ErrorResponse(
  message: string = "Something went wrong",
  status: number = 501,
  data: unknown = [],
) {
  return NextResponse.json<ApiResponse>(
    { success: false, message, data, status },
    { status },
  );
}
