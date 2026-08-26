import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Lead } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { leadUpdateSchema } from "@/lib/validations/lead";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid lead id", 400, []);
  }

  try {
    await connectToDatabase();
    const lead = await Lead.findById(id).populate("assignedTo", "firstName lastName").lean();

    if (!lead) {
      return NotFoundResponse("Lead not found");
    }

    return SuccessResponse("Lead", 200, lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return ErrorResponse("Error fetching lead", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid lead id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = leadUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();
    const lead = await Lead.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("assignedTo", "firstName lastName")
      .lean();

    if (!lead) {
      return NotFoundResponse("Lead not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Lead updated successfully", data: lead },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lead:", error);
    return ErrorResponse("Error updating lead", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid lead id", 400, []);
  }

  try {
    await connectToDatabase();
    const lead = await Lead.findByIdAndDelete(id).lean();

    if (!lead) {
      return NotFoundResponse("Lead not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Lead deleted successfully", data: lead },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lead:", error);
    return ErrorResponse("Error deleting lead", 500, []);
  }
}
