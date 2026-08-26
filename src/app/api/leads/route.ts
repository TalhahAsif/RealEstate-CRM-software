import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Lead } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { leadSchema } from "@/lib/validations/lead";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .populate("assignedTo", "firstName lastName")
      .lean();
    return SuccessResponse("Leads", 200, leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return ErrorResponse("Error fetching leads", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const lead = await Lead.create(parsed.data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Lead created successfully", data: lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lead:", error);
    return ErrorResponse("Error creating lead", 500, []);
  }
}
