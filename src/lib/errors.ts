import { ApiError } from "@/services/api";

export interface FormError {
  message: string;
  details: string[];
}

export function formError(
  error: unknown,
  byStatus: Partial<Record<number, string>> = {},
): FormError {
  if (error instanceof ApiError) {
    const override = byStatus[error.status];
    if (override) return { message: override, details: [] };
    if (error.details.length > 0) {
      return { message: "Check these details and try again:", details: error.details };
    }
    return { message: error.message, details: [] };
  }
  if (error instanceof Error && error.message) return { message: error.message, details: [] };
  return { message: "Something went wrong. Try again.", details: [] };
}

export function problem(message: string): FormError {
  return { message, details: [] };
}

export const CODE_REJECTED =
  "That code is wrong or has expired. Use the newest code we sent you, or send a new one.";
