import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import type { ApiResponse } from "@/types";

export async function POST() {
  await destroySession();

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Signed out successfully",
  });
}
