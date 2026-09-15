import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Customer, Property } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { findMatchingCustomers } from "@/lib/matching";

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

    const property = await Property.findById(id).lean();
    if (!property) {
      return NotFoundResponse("Property not found");
    }

    const customers = await Customer.find()
      .populate("assignedAgent", "firstName lastName")
      .lean();

    const matches = findMatchingCustomers(property, customers).map(({ item, score }) => ({
      ...item,
      matchScore: score,
    }));

    return SuccessResponse("Matching customers", 200, matches);
  } catch (error) {
    console.error("Error finding matching customers:", error);
    return ErrorResponse("Error finding matching customers", 500, []);
  }
}
