import {
  boolean,
  booleanOr,
  isObject,
  object,
  optionalString,
  string,
  stringArray,
  stringOr,
} from "@/lib/decode";
import type { Company, Director } from "@/types";

function parseDirector(value: unknown): Director | undefined {
  if (!isObject(value)) return undefined;
  return {
    fullName: string(value, "fullName"),
    phone: stringOr(value, "phone", ""),
  };
}

export function parseCompany(data: unknown): Company {
  const source = object(data, "company");
  return {
    _id: string(source, "_id"),
    companyName: stringOr(source, "companyName", ""),
    email: string(source, "email"),
    googleId: optionalString(source, "googleId"),
    director: parseDirector(source.director),
    isVerified: boolean(source, "isVerified"),
    approved: booleanOr(source, "approved", false),
    phone: stringOr(source, "phone", ""),
    location: stringOr(source, "location", ""),
    description: stringOr(source, "description", ""),
    website: stringOr(source, "website", ""),
    operatingCities: stringArray(source, "operatingCities"),
    isProfileComplete: booleanOr(source, "isProfileComplete", false),
    logoUrl: stringOr(source, "logoUrl", ""),
    createdAt: string(source, "createdAt"),
    updatedAt: string(source, "updatedAt"),
  };
}
