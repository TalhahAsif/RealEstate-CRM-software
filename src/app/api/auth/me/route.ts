import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import type { ApiResponse } from "@/types";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const { password: _password, ...safeUser } = user.toObject();

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Authenticated",
    data: safeUser,
  });
}
