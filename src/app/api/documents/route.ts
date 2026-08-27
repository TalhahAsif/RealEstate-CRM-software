import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Document } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { documentSchema } from "@/lib/validations/document";
import type { ApiResponse } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const query: Record<string, unknown> = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    await connectToDatabase();
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "firstName lastName email")
      .lean();
    return SuccessResponse("Documents fetched successfully", 200, documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return ErrorResponse("Error fetching documents", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = documentSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const document = await Document.create(parsed.data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Document created successfully", data: document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return ErrorResponse("Error creating document", 500, []);
  }
}
