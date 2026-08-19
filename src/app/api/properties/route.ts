import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Properties");
}

export async function POST() {
  return notImplementedResponse("Creating a property");
}
