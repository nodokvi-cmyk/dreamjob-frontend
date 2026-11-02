import { ApiError } from "@/services/api";

export function staleMessage(error: unknown): string | null {
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) {
    return error.message;
  }
  return null;
}
