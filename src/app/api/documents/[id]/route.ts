import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Document } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { documentUpdateSchema } from "@/lib/validations/document";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid document id", 400, []);
  }

  try {
    await connectToDatabase();
    const document = await Document.findById(id)
      .populate("uploadedBy", "firstName lastName email")
      .lean();

    if (!document) {
      return NotFoundResponse("Document not found");
    }

    return SuccessResponse("Document details", 200, document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return ErrorResponse("Error fetching document", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid document id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = documentUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();
    const document = await Document.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("uploadedBy", "firstName lastName email")
      .lean();

    if (!document) {
      return NotFoundResponse("Document not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Document updated successfully", data: document },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating document:", error);
    return ErrorResponse("Error updating document", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid document id", 400, []);
  }

  try {
    await connectToDatabase();
    const document = await Document.findByIdAndDelete(id).lean();

    if (!document) {
      return NotFoundResponse("Document not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Document deleted successfully", data: document },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    return ErrorResponse("Error deleting document", 500, []);
  }
}
