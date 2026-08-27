import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Deal } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { dealUpdateSchema } from "@/lib/validations/deal";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid deal id", 400, []);
  }

  try {
    await connectToDatabase();
    const deal = await Deal.findById(id)
      .populate("customer", "firstName lastName email phone")
      .populate("property", "title propertyId price city")
      .populate("agent", "firstName lastName email")
      .lean();

    if (!deal) {
      return NotFoundResponse("Deal not found");
    }

    return SuccessResponse("Deal details", 200, deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    return ErrorResponse("Error fetching deal", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid deal id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = dealUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const updateData = { ...parsed.data };
    if (updateData.stage === "closed" && !updateData.closedAt) {
      updateData.closedAt = new Date().toISOString();
    }

    const deal = await Deal.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("customer", "firstName lastName email phone")
      .populate("property", "title propertyId price city")
      .populate("agent", "firstName lastName email")
      .lean();

    if (!deal) {
      return NotFoundResponse("Deal not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Deal updated successfully", data: deal },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating deal:", error);
    return ErrorResponse("Error updating deal", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid deal id", 400, []);
  }

  try {
    await connectToDatabase();
    const deal = await Deal.findByIdAndDelete(id).lean();

    if (!deal) {
      return NotFoundResponse("Deal not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Deal deleted successfully", data: deal },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting deal:", error);
    return ErrorResponse("Error deleting deal", 500, []);
  }
}
