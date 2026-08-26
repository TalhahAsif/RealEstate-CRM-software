import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { FollowUp } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { followUpSchema } from "@/lib/validations/follow-up";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const followUps = await FollowUp.find()
      .sort({ scheduledAt: 1 })
      .populate("lead", "firstName lastName")
      .populate("customer", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .lean();
    return SuccessResponse("Follow-ups", 200, followUps);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return ErrorResponse("Error fetching follow-ups", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = followUpSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const followUp = await FollowUp.create(parsed.data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Follow-up created successfully", data: followUp },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating follow-up:", error);
    return ErrorResponse("Error creating follow-up", 500, []);
  }
}
