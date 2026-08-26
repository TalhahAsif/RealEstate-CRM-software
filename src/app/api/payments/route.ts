import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Payment } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { paymentSchema } from "@/lib/validations/payment";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const payments = await Payment.find()
      .sort({ paymentDate: -1 })
      .populate("deal", "dealNumber")
      .populate("customer", "firstName lastName")
      .lean();
    return SuccessResponse("Payments", 200, payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return ErrorResponse("Error fetching payments", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const payment = await Payment.create(parsed.data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Payment created successfully", data: payment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return ErrorResponse("Error creating payment", 500, []);
  }
}
