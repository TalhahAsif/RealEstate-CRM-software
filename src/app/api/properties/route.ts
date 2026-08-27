import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Property } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { propertySchema } from "@/lib/validations/property";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .populate("owner", "firstName lastName email phone")
      .populate("assignedAgent", "firstName lastName email")
      .populate("project", "name location")
      .lean();
    return SuccessResponse("Properties fetched successfully", 200, properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return ErrorResponse("Error fetching properties", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = propertySchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const data = { ...parsed.data };
    if (!data.propertyId) {
      data.propertyId = `PR-${Date.now().toString().slice(-6)}`;
    }

    const property = await Property.create(data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Property created successfully", data: property },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating property:", error);
    return ErrorResponse("Error creating property", 500, []);
  }
}
