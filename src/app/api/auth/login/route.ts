import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/models/User";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import type { ApiResponse } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  await connectToDatabase();

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !user.isActive || !(await verifyPassword(password, user.password))) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Invalid email or password" },
      { status: 401 }
    );
  }

  await createSession(user.id);

  const { password: _password, ...safeUser } = user.toObject();

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Signed in successfully",
    data: safeUser,
  });
}
