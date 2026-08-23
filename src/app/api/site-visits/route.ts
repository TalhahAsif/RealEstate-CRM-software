import { SuccessResponse, ErrorResponse } from "@/lib/api/response";

export async function GET() {
  return SuccessResponse("Site visits");
}

export async function POST() {
  return ErrorResponse("Scheduling a site visit is not implemented yet.");
}
