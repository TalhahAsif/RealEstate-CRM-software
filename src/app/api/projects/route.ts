import { NextResponse } from "next/server";
import { SuccessResponse, ErrorResponse } from "@/lib/api/response";
import { Project } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";
import { projectSchema } from "@/lib/validations/project";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    return SuccessResponse("Projects", 200, projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return ErrorResponse("Error fetching projects", 500, []);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return ErrorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400, []);
  }

  try {
    await connectToDatabase();

    const project = await Project.create(parsed.data);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Project created successfully", data: project },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return ErrorResponse("Error creating project", 500, []);
  }
}
