export type JsonObject = Record<string, unknown>;

export class DecodeError extends Error {
  constructor(path: string) {
    super(`Unexpected response from the server (${path})`);
    this.name = "DecodeError";
  }
}

export function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function object(value: unknown, path = "body"): JsonObject {
  if (!isObject(value)) throw new DecodeError(path);
  return value;
}

export function string(source: JsonObject, key: string): string {
  const value = source[key];
  if (typeof value !== "string") throw new DecodeError(key);
  return value;
}

export function optionalString(source: JsonObject, key: string): string | undefined {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new DecodeError(key);
  return value;
}

export function stringOr(source: JsonObject, key: string, fallback: string): string {
  return optionalString(source, key) ?? fallback;
}

export function number(source: JsonObject, key: string): number {
  const value = source[key];
  if (typeof value !== "number" || Number.isNaN(value)) throw new DecodeError(key);
  return value;
}

export function optionalNumber(source: JsonObject, key: string): number | undefined {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) throw new DecodeError(key);
  return value;
}

export function boolean(source: JsonObject, key: string): boolean {
  const value = source[key];
  if (typeof value !== "boolean") throw new DecodeError(key);
  return value;
}

export function booleanOr(source: JsonObject, key: string, fallback: boolean): boolean {
  const value = source[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "boolean") throw new DecodeError(key);
  return value;
}

export function stringArray(source: JsonObject, key: string): string[] {
  const value = source[key];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new DecodeError(key);
  return value.map((item, index) => {
    if (typeof item !== "string") throw new DecodeError(`${key}[${index}]`);
    return item;
  });
}

export function oneOf<T extends string>(
  source: JsonObject,
  key: string,
  allowed: readonly T[],
): T {
  const value = source[key];
  const match = allowed.find((option) => option === value);
  if (match === undefined) throw new DecodeError(key);
  return match;
}

export function array<T>(
  value: unknown,
  path: string,
  item: (entry: unknown) => T,
): T[] {
  if (!Array.isArray(value)) throw new DecodeError(path);
  return value.map(item);
}
