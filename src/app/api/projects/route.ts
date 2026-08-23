import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Projects");
}

export async function POST() {
  return ErrorResponse("Creating a project is not implemented yet.");
}
