import { NextResponse, type NextRequest } from "next/server";
import { isObject } from "@/lib/decode";
import {
  GOOGLE_ERROR_PARAM,
  googleErrorCodeForStatus,
  type GoogleErrorCode,
} from "@/lib/googleRedirect";
import { routes, withQuery } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { signInWithGoogle } from "@/services/auth.service";
import type { AccountType } from "@/types";

const CSRF_NAME = "g_csrf_token";
const MAX_CREDENTIAL_LENGTH = 8192;

interface GoogleForm {
  credential: string;
  csrf: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function readForm(request: NextRequest): Promise<GoogleForm> {
  try {
    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      const data: unknown = await request.json();
      if (!isObject(data)) return { credential: "", csrf: "" };
      return { credential: text(data.credential), csrf: text(data[CSRF_NAME]) };
    }
    const form = await request.formData();
    return { credential: text(form.get("credential")), csrf: text(form.get(CSRF_NAME)) };
  } catch {
    return { credential: "", csrf: "" };
  }
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function fail(request: NextRequest, code: GoogleErrorCode): NextResponse {
  return redirectTo(request, withQuery(routes.signIn, { [GOOGLE_ERROR_PARAM]: code }));
}

export async function handleGoogleCallback(
  request: NextRequest,
  account: AccountType,
): Promise<NextResponse> {
  const { credential, csrf } = await readForm(request);
  const cookie = request.cookies.get(CSRF_NAME)?.value ?? "";
  if (csrf === "" || csrf !== cookie) return fail(request, "csrf");
  if (credential === "" || credential.length > MAX_CREDENTIAL_LENGTH) {
    return fail(request, "missing");
  }
  try {
    const { token } = await signInWithGoogle(account, credential);
    return redirectTo(request, `${routes.googleComplete}#token=${encodeURIComponent(token)}`);
  } catch (reason: unknown) {
    return fail(request, reason instanceof ApiError ? googleErrorCodeForStatus(reason.status) : "failed");
  }
}
