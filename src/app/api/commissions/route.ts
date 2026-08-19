import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Commissions");
}

export async function POST() {
  return notImplementedResponse("Creating a commission record");
}
