import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Customers");
}

export async function POST() {
  return ErrorResponse("Creating a customer is not implemented yet.");
}
