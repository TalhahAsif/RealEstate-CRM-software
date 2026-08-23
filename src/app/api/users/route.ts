import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Users");
}

export async function POST() {
  return notImplementedResponse("Creating a user");
}

