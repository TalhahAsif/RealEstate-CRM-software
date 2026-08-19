import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Deals");
}

export async function POST() {
  return notImplementedResponse("Creating a deal");
}
