import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Commissions");
}

export async function POST() {
  return ErrorResponse("Creating a commission record is not implemented yet.");
}
