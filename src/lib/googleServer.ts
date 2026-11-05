import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isObject } from "@/lib/decode";
import {
  GOOGLE_ERROR_PARAM,
  googleCallbackPath,
  googleErrorCodeForStatus,
  type GoogleErrorCode,
} from "@/lib/googleRedirect";
import { routes, withQuery } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { signInWithGoogle } from "@/services/auth.service";
import type { AccountType } from "@/types";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const COOKIE_NAME = "gdj_google";
const COOKIE_PATH = "/api/google";
const COOKIE_MAX_AGE = 600;
const MAX_TOKEN_LENGTH = 8192;

interface GoogleForm {
  idToken: string;
  state: string;
  error: string;
}

interface Saved {
  state: string;
  nonce: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: COOKIE_PATH,
    maxAge,
  } as const;
}

function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function nonceOf(idToken: string): string {
  const payload = idToken.split(".")[1];
  if (!payload) return "";
  try {
    const data: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return isObject(data) ? text(data.nonce) : "";
  } catch {
    return "";
  }
}

function savedFrom(request: NextRequest): Saved | null {
  const [state, nonce, ...rest] = (request.cookies.get(COOKIE_NAME)?.value ?? "").split(".");
  if (!state || !nonce || rest.length > 0) return null;
  return { state, nonce };
}

async function readForm(request: NextRequest): Promise<GoogleForm> {
  try {
    const form = await request.formData();
    return {
      idToken: text(form.get("id_token")),
      state: text(form.get("state")),
      error: text(form.get("error")),
    };
  } catch {
    return { idToken: "", state: "", error: "" };
  }
}

function redirectTo(request: NextRequest, target: string | URL): NextResponse {
  const response = NextResponse.redirect(
    typeof target === "string" ? new URL(target, request.url) : target,
    303,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function fail(request: NextRequest, code: GoogleErrorCode): NextResponse {
  return redirectTo(request, withQuery(routes.signIn, { [GOOGLE_ERROR_PARAM]: code }));
}

function spent(response: NextResponse): NextResponse {
  response.cookies.set({ name: COOKIE_NAME, value: "", ...cookieOptions(0) });
  return response;
}

export function startGoogleSignIn(request: NextRequest): NextResponse {
  const raw = request.nextUrl.searchParams.get("account");
  const account = raw === "company" || raw === "user" ? raw : null;
  if (account === null || CLIENT_ID === "") return fail(request, "failed");

  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const target = new URL(AUTH_ENDPOINT);
  target.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: new URL(googleCallbackPath(account), request.url).href,
    response_type: "id_token",
    response_mode: "form_post",
    scope: "openid email profile",
    state,
    nonce,
    prompt: "select_account",
  }).toString();

  const response = redirectTo(request, target);
  response.cookies.set({
    name: COOKIE_NAME,
    value: `${state}.${nonce}`,
    ...cookieOptions(COOKIE_MAX_AGE),
  });
  return response;
}

export async function handleGoogleCallback(
  request: NextRequest,
  account: AccountType,
): Promise<NextResponse> {
  const form = await readForm(request);
  const saved = savedFrom(request);
  if (saved === null || form.state === "" || !sameText(form.state, saved.state)) {
    return spent(fail(request, "csrf"));
  }
  if (form.error !== "") {
    return spent(fail(request, form.error === "access_denied" ? "cancelled" : "failed"));
  }
  if (form.idToken === "" || form.idToken.length > MAX_TOKEN_LENGTH) {
    return spent(fail(request, "missing"));
  }
  if (!sameText(nonceOf(form.idToken), saved.nonce)) return spent(fail(request, "csrf"));

  try {
    const { token } = await signInWithGoogle(account, form.idToken);
    return spent(redirectTo(request, `${routes.googleComplete}#token=${encodeURIComponent(token)}`));
  } catch (reason: unknown) {
    const code = reason instanceof ApiError ? googleErrorCodeForStatus(reason.status) : "failed";
    return spent(fail(request, code));
  }
}
