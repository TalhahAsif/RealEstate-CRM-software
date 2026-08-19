import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Payments");
}

export async function POST() {
  return notImplementedResponse("Creating a payment");
}
