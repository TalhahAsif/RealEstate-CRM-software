import {
  SuccessResponse,
  NotFoundResponse,
  ErrorResponse,
} from "@/lib/api/response";
import { User } from "@/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await User.find().lean();
    return SuccessResponse("Users", 200, users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return ErrorResponse("Error fetching users", 500, []);
  }
}

export async function POST() {
  return ErrorResponse("Creating a user");
}
