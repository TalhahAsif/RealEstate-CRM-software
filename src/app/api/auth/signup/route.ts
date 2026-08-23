import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/models/User";
import { signupSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import type { ApiResponse } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  await connectToDatabase();

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: await hashPassword(password),
  });

  await createSession(user.id);

  const { password: _password, ...safeUser } = user.toObject();

  return NextResponse.json<ApiResponse>(
    { success: true, message: "Account created successfully", data: safeUser },
    { status: 201 }
  );
}
