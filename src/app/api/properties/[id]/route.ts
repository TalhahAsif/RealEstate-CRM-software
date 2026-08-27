import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Property } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { propertyUpdateSchema } from "@/lib/validations/property";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid property id", 400, []);
  }

  try {
    await connectToDatabase();
    const property = await Property.findById(id)
      .populate("owner", "firstName lastName email phone")
      .populate("assignedAgent", "firstName lastName email")
      .populate("project", "name location")
      .lean();

    if (!property) {
      return NotFoundResponse("Property not found");
    }

    return SuccessResponse("Property details", 200, property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return ErrorResponse("Error fetching property", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid property id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = propertyUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();
    const property = await Property.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("owner", "firstName lastName email phone")
      .populate("assignedAgent", "firstName lastName email")
      .populate("project", "name location")
      .lean();

    if (!property) {
      return NotFoundResponse("Property not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Property updated successfully", data: property },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating property:", error);
    return ErrorResponse("Error updating property", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid property id", 400, []);
  }

  try {
    await connectToDatabase();
    const property = await Property.findByIdAndDelete(id).lean();

    if (!property) {
      return NotFoundResponse("Property not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Property deleted successfully", data: property },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting property:", error);
    return ErrorResponse("Error deleting property", 500, []);
  }
}
