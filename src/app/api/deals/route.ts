import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Deal } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { dealSchema } from "@/lib/validations/deal";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const deals = await Deal.find()
      .sort({ createdAt: -1 })
      .populate("customer", "firstName lastName email phone")
      .populate("property", "title propertyId price city")
      .populate("agent", "firstName lastName email")
      .lean();
    return SuccessResponse("Deals fetched successfully", 200, deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return ErrorResponse("Error fetching deals", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = dealSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const data = { ...parsed.data };
    if (!data.dealNumber) {
      data.dealNumber = `DEAL-${Date.now().toString().slice(-6)}`;
    }

    if (data.commissionPercentage != null && data.commissionAmount == null) {
      data.commissionAmount = (data.dealAmount * data.commissionPercentage) / 100;
    }

    if (data.stage === "closed" && !data.closedAt) {
      data.closedAt = new Date().toISOString();
    }

    const deal = await Deal.create(data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Deal created successfully", data: deal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating deal:", error);
    return ErrorResponse("Error creating deal", 500, []);
  }
}
