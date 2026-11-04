import type { NextRequest } from "next/server";
import { handleGoogleCallback } from "@/lib/googleServer";

export function POST(request: NextRequest) {
  return handleGoogleCallback(request, "user");
}
