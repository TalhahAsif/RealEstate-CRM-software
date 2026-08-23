import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Leads");
}

export async function POST() {
  return ErrorResponse("Creating a lead is not implemented yet.");
}
