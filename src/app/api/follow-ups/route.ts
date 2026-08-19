import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Follow-ups");
}

export async function POST() {
  return notImplementedResponse("Creating a follow-up");
}
