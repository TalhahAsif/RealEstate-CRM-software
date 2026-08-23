import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Follow-ups");
}

export async function POST() {
  return ErrorResponse("Creating a follow-up is not implemented yet.");
}
