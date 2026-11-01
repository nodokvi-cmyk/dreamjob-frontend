import { isObject } from "@/lib/decode";
import { tokenStore } from "@/lib/token";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: Method;
  body?: FormData | object;
  token?: string | null;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach DreamJob. Check your connection and try again.";

function messageFrom(data: unknown, status: number): string {
  if (isObject(data)) {
    const { message } = data;
    if (typeof message === "string" && message.trim() !== "") return message;
    if (Array.isArray(message)) {
      const parts = message.filter(
        (part): part is string => typeof part === "string",
      );
      if (parts.length > 0) return parts.join(". ");
    }
  }
  if (status === 429) return "Too many attempts. Wait a minute and try again.";
  if (status >= 500) return "Something went wrong on our side. Try again soon.";
  return `Request failed (${status})`;
}

function codeFrom(data: unknown): string | undefined {
  if (isObject(data) && typeof data.code === "string") return data.code;
  return undefined;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") return null;
  try {
    const data: unknown = JSON.parse(text);
    return data;
  } catch {
    return text;
  }
}

export async function api<T>(
  path: string,
  parse: (data: unknown) => T,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal, cache } = options;
  const token = options.token === undefined ? tokenStore.get() : options.token;
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: payload,
      signal,
      cache,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(NETWORK_MESSAGE, 0);
  }

  const data = await readBody(response);
  if (!response.ok) {
    throw new ApiError(
      messageFrom(data, response.status),
      response.status,
      codeFrom(data),
    );
  }
  return parse(data);
}
