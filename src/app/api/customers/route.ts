import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Customer } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { customerSchema } from "@/lib/validations/customer";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .populate("assignedAgent", "firstName lastName")
      .lean();
    return SuccessResponse("Customers", 200, customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return ErrorResponse("Error fetching customers", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const customer = await Customer.create(parsed.data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Customer created successfully", data: customer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return ErrorResponse("Error creating customer", 500, []);
  }
}
