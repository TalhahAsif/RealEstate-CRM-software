import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Properties");
}

export async function POST() {
  return ErrorResponse("Creating a property is not implemented yet.");
}
