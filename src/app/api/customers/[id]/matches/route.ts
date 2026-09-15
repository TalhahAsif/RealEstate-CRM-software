import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Customer, Property } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { findMatchingProperties } from "@/lib/matching";

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

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NotFoundResponse("Customer not found");
    }

    const properties = await Property.find({ status: "available" })
      .populate("assignedAgent", "firstName lastName email")
      .populate("project", "name location")
      .lean();

    const matches = findMatchingProperties(customer, properties).map(({ item, score }) => ({
      ...item,
      matchScore: score,
    }));

    return SuccessResponse("Matching properties", 200, matches);
  } catch (error) {
    console.error("Error finding matching properties:", error);
    return ErrorResponse("Error finding matching properties", 500, []);
  }
}
