import { readyResponse, notImplementedResponse } from "@/lib/api/response";

export async function GET() {
  return readyResponse("Projects");
}

export async function POST() {
  return notImplementedResponse("Creating a project");
}
