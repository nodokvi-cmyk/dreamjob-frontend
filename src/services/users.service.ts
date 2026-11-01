import {
  boolean,
  booleanOr,
  object,
  oneOf,
  optionalNumber,
  optionalString,
  string,
  stringArray,
  stringOr,
} from "@/lib/decode";
import type { User, UserRole } from "@/types";

const USER_ROLES: readonly UserRole[] = ["user", "admin"];

export function parseUser(data: unknown): User {
  const source = object(data, "user");
  return {
    _id: string(source, "_id"),
    role: oneOf(source, "role", USER_ROLES),
    firstName: string(source, "firstName"),
    lastName: stringOr(source, "lastName", ""),
    birthDate: optionalString(source, "birthDate"),
    age: optionalNumber(source, "age"),
    googleId: optionalString(source, "googleId"),
    email: string(source, "email"),
    phone: stringOr(source, "phone", ""),
    isVerified: boolean(source, "isVerified"),
    isCvPublic: booleanOr(source, "isCvPublic", false),
    appliedVacancies: stringArray(source, "appliedVacancies"),
    avatarUrl: stringOr(source, "avatarUrl", ""),
    hasCv: booleanOr(source, "hasCv", false),
    createdAt: string(source, "createdAt"),
    updatedAt: string(source, "updatedAt"),
  };
}
