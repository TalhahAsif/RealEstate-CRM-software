import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Site visits");
}

export async function POST() {
  return notImplementedResponse("Scheduling a site visit");
}
