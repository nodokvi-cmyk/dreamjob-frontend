import type { NextRequest } from "next/server";
import { startGoogleSignIn } from "@/lib/googleServer";

export function GET(request: NextRequest) {
  return startGoogleSignIn(request);
}
