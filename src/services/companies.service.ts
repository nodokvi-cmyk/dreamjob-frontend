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
import { api } from "@/services/api";
import { parseMessage } from "@/services/auth.service";
import type {
  ChangePasswordInput,
  Company,
  CompanyUpdateInput,
  Director,
  MessageResponse,
} from "@/types";

function companyPath(id: string, action?: string): string {
  const base = `/companies/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

export function setCompanyPassword(
  id: string,
  input: ChangePasswordInput,
): Promise<MessageResponse> {
  return api(companyPath(id, "password"), parseMessage, { method: "PATCH", body: input });
}

export function updateCompany(id: string, input: CompanyUpdateInput): Promise<Company> {
  return api(companyPath(id), parseCompany, { method: "PATCH", body: input });
}

export function uploadLogo(id: string, file: File): Promise<Company> {
  const body = new FormData();
  body.append("logo", file);
  return api(companyPath(id, "logo"), parseCompany, { method: "PATCH", body });
}

export function removeLogo(id: string): Promise<Company> {
  return api(companyPath(id, "logo"), parseCompany, { method: "DELETE" });
}

export function deleteCompany(id: string): Promise<Company> {
  return api(companyPath(id), parseCompany, { method: "DELETE" });
}

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
