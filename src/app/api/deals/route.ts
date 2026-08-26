import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Deal } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    const deals = await Deal.find()
      .sort({ createdAt: -1 })
      .populate("customer", "firstName lastName")
      .lean();
    return SuccessResponse("Deals", 200, deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return ErrorResponse("Error fetching deals", 500, []);
  }
}

export async function POST() {
  return ErrorResponse("Creating a deal is not implemented yet.");
}
