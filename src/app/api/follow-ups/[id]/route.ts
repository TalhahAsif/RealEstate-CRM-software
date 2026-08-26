import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { FollowUp } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { followUpUpdateSchema } from "@/lib/validations/follow-up";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const POPULATE_FIELDS = [
  { path: "lead", select: "firstName lastName" },
  { path: "customer", select: "firstName lastName" },
  { path: "assignedTo", select: "firstName lastName" },
];

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid follow-up id", 400, []);
  }

  try {
    await connectToDatabase();
    const followUp = await FollowUp.findById(id).populate(POPULATE_FIELDS).lean();

    if (!followUp) {
      return NotFoundResponse("Follow-up not found");
    }

    return SuccessResponse("Follow-up", 200, followUp);
  } catch (error) {
    console.error("Error fetching follow-up:", error);
    return ErrorResponse("Error fetching follow-up", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid follow-up id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = followUpUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  const { lead, customer, ...rest } = parsed.data;
  const setFields: Record<string, unknown> = { ...rest };
  const unsetFields: Record<string, ""> = {};

  if (lead === null) unsetFields.lead = "";
  else if (lead !== undefined) setFields.lead = lead;

  if (customer === null) unsetFields.customer = "";
  else if (customer !== undefined) setFields.customer = customer;

  try {
    await connectToDatabase();
    const followUp = await FollowUp.findByIdAndUpdate(
      id,
      {
        ...(Object.keys(setFields).length ? { $set: setFields } : {}),
        ...(Object.keys(unsetFields).length ? { $unset: unsetFields } : {}),
      },
      { returnDocument: "after", runValidators: true }
    )
      .populate(POPULATE_FIELDS)
      .lean();

    if (!followUp) {
      return NotFoundResponse("Follow-up not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Follow-up updated successfully", data: followUp },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating follow-up:", error);
    return ErrorResponse("Error updating follow-up", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid follow-up id", 400, []);
  }

  try {
    await connectToDatabase();
    const followUp = await FollowUp.findByIdAndDelete(id).lean();

    if (!followUp) {
      return NotFoundResponse("Follow-up not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Follow-up deleted successfully", data: followUp },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting follow-up:", error);
    return ErrorResponse("Error deleting follow-up", 500, []);
  }
}
