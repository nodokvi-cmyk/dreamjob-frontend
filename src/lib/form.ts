export function readText(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function optional(value: string): string | undefined {
  return value === "" ? undefined : value;
}

export function splitList(value: string): string[] {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
  return Array.from(new Set(items));
}

export function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const PHONE_PATTERN = String.raw`\+?[\d\s\(\)\-]{6,20}`;

export const PHONE_HINT = "Digits, spaces, + ( ) and - only.";
