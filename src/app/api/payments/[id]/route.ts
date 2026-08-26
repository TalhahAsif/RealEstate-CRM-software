import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Payment } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { paymentUpdateSchema } from "@/lib/validations/payment";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const POPULATE_FIELDS = [
  { path: "deal", select: "dealNumber" },
  { path: "customer", select: "firstName lastName" },
];

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid payment id", 400, []);
  }

  try {
    await connectToDatabase();
    const payment = await Payment.findById(id).populate(POPULATE_FIELDS).lean();

    if (!payment) {
      return NotFoundResponse("Payment not found");
    }

    return SuccessResponse("Payment", 200, payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return ErrorResponse("Error fetching payment", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid payment id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = paymentUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();
    const payment = await Payment.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate(POPULATE_FIELDS)
      .lean();

    if (!payment) {
      return NotFoundResponse("Payment not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Payment updated successfully", data: payment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return ErrorResponse("Error updating payment", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid payment id", 400, []);
  }

  try {
    await connectToDatabase();
    const payment = await Payment.findByIdAndDelete(id).lean();

    if (!payment) {
      return NotFoundResponse("Payment not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Payment deleted successfully", data: payment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting payment:", error);
    return ErrorResponse("Error deleting payment", 500, []);
  }
}
