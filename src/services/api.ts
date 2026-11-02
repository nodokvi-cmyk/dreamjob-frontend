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
  readonly details: string[];

  constructor(message: string, status: number, code?: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach DreamJob. Check your connection and try again.";

export const TOO_MANY_MESSAGE = "Too many attempts. Wait a minute and try again.";

function messagesFrom(data: unknown): string[] {
  if (!isObject(data)) return [];
  const { message } = data;
  if (typeof message === "string" && message.trim() !== "") return [message];
  if (Array.isArray(message)) {
    return message.filter(
      (part): part is string => typeof part === "string" && part.trim() !== "",
    );
  }
  return [];
}

const COOLDOWN_MESSAGE = /^Wait \d+ seconds?\b/;

function messageFrom(messages: string[], status: number): string {
  if (status === 429) {
    const cooldown = messages.find((message) => COOLDOWN_MESSAGE.test(message));
    return cooldown ? `${cooldown}.` : TOO_MANY_MESSAGE;
  }
  if (status >= 500) return "Something went wrong on our side. Try again soon.";
  if (messages.length > 0) return messages.join(". ");
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
    const messages = messagesFrom(data);
    const details = response.status === 400 && messages.length > 1 ? messages : [];
    throw new ApiError(
      messageFrom(messages, response.status),
      response.status,
      codeFrom(data),
      details,
    );
  }
  return parse(data);
}
