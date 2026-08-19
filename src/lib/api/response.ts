import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/** Standard "endpoint scaffolded, CRUD not implemented yet" GET response. */
export function readyResponse(resource: string) {
  return NextResponse.json<ApiResponse>({
    success: true,
    message: `${resource} API is ready. CRUD handlers are not implemented yet.`,
    data: [],
  });
}

/** Standard 501 response for write operations that aren't built yet. */
export function notImplementedResponse(action: string) {
  return NextResponse.json<ApiResponse>(
    { success: false, message: `${action} is not implemented yet.` },
    { status: 501 }
  );
}
