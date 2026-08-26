import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SuccessResponse, ErrorResponse, NotFoundResponse } from "@/lib/api/response";
import { Project } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { projectUpdateSchema } from "@/lib/validations/project";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid project id", 400, []);
  }

  try {
    await connectToDatabase();
    const project = await Project.findById(id).lean();

    if (!project) {
      return NotFoundResponse("Project not found");
    }

    return SuccessResponse("Project", 200, project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return ErrorResponse("Error fetching project", 500, []);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid project id", 400, []);
  }

  const body = await request.json().catch(() => null);
  const parsed = projectUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();
    const project = await Project.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!project) {
      return NotFoundResponse("Project not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Project updated successfully", data: project },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return ErrorResponse("Error updating project", 500, []);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return ErrorResponse("Invalid project id", 400, []);
  }

  try {
    await connectToDatabase();
    const project = await Project.findByIdAndDelete(id).lean();

    if (!project) {
      return NotFoundResponse("Project not found");
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Project deleted successfully", data: project },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return ErrorResponse("Error deleting project", 500, []);
  }
}
