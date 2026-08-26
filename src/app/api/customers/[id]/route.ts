import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Customer } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { customerUpdateSchema } from "@/lib/validations/customer";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid customer id", 400, []);
  }

  try {
    await connectToDatabase();
    const customer = await Customer.findById(id)
      .populate("assignedAgent", "firstName lastName")
      .lean();

    if (!customer) {
      return NotFoundResponse("Customer not found");
    }

    return SuccessResponse("Customer", 200, customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return ErrorResponse("Error fetching customer", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid customer id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = customerUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();
    const customer = await Customer.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("assignedAgent", "firstName lastName")
      .lean();

    if (!customer) {
      return NotFoundResponse("Customer not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Customer updated successfully", data: customer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating customer:", error);
    return ErrorResponse("Error updating customer", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid customer id", 400, []);
  }

  try {
    await connectToDatabase();
    const customer = await Customer.findByIdAndDelete(id).lean();

    if (!customer) {
      return NotFoundResponse("Customer not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Customer deleted successfully", data: customer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting customer:", error);
    return ErrorResponse("Error deleting customer", 500, []);
  }
}
