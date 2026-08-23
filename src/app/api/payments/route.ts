import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Payments");
}

export async function POST() {
  return ErrorResponse("Creating a payment is not implemented yet.");
}
