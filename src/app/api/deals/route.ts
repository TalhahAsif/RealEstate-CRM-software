import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Deals");
}

export async function POST() {
  return ErrorResponse("Creating a deal is not implemented yet.");
}
