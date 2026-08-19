import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Customers");
}

export async function POST() {
  return notImplementedResponse("Creating a customer");
}
