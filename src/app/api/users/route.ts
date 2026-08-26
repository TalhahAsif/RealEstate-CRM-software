import {
  SuccessResponse,
  ErrorResponse,
} from "@/lib/api/response";
import { User } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { userSchema } from "@/lib/validations/user";
import { hashPassword } from "@/lib/auth/password";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const users = await User.find().lean();
    return SuccessResponse("Users", 200, users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return ErrorResponse("Error fetching users", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = userSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  const { password, ...rest } = parsed.data;

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email: rest.email.toLowerCase() });
    if (existingUser) {
      return ErrorResponse("An account with this email already exists", 409, []);
    }

    const user = await User.create({
      ...rest,
      password: await hashPassword(password),
    });

    const { password: _password, ...safeUser } = user.toObject();

    return NextResponse.json<ApiResponse>(
      { success: true, message: "User created successfully", data: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return ErrorResponse("Error creating user", 500, []);
  }
}
