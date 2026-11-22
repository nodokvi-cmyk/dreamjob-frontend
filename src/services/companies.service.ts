import {
  array,
  boolean,
  booleanOr,
  isObject,
  nullableNumber,
  number,
  object,
  optionalIsoDate,
  optionalNumber,
  optionalOneOf,
  optionalString,
  pageParser,
  string,
  stringArray,
  stringOr,
} from "@/lib/decode";
import { BILLING_PLANS } from "@/lib/billing";
import { api } from "@/services/api";
import { parseMessage } from "@/services/auth.service";
import type {
  ChangePasswordInput,
  Company,
  CompanyUpdateInput,
  Director,
  MessageResponse,
  PublicCompany,
  PublicCompanyCard,
  RatingResult,
  TopRatedCompany,
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
    plan: optionalOneOf(source, "plan", BILLING_PLANS),
    credits: optionalNumber(source, "credits") ?? 0,
    purchasedCredits: optionalNumber(source, "purchasedCredits") ?? 0,
    planRenewsAt: optionalIsoDate(source, "planRenewsAt"),
    planEndsAtPeriodEnd: booleanOr(source, "planEndsAtPeriodEnd", false),
    createdAt: string(source, "createdAt"),
    updatedAt: string(source, "updatedAt"),
  };
}

export function choosePayAsYouPublish(id: string): Promise<Company> {
  return api(companyPath(id, "plan"), parseCompany, {
    method: "PATCH",
    body: { plan: "payAsYouPublish" },
  });
}

function parsePublicCompanyCard(data: unknown): PublicCompanyCard {
  const source = object(data, "company");
  return {
    id: string(source, "id"),
    companyName: stringOr(source, "companyName", ""),
    logoUrl: stringOr(source, "logoUrl", ""),
    excerpt: stringOr(source, "excerpt", ""),
    location: stringOr(source, "location", ""),
    operatingCities: stringArray(source, "operatingCities"),
    openVacancies: optionalNumber(source, "openVacancies") ?? 0,
    rating: nullableNumber(source, "rating"),
  };
}

export const parsePublicCompanyPage = pageParser("companies", parsePublicCompanyCard);

export function parsePublicCompany(data: unknown): PublicCompany {
  const source = object(data, "company");
  return {
    id: string(source, "id"),
    openVacancies: optionalNumber(source, "openVacancies") ?? 0,
    companyName: stringOr(source, "companyName", ""),
    description: stringOr(source, "description", ""),
    website: stringOr(source, "website", ""),
    location: stringOr(source, "location", ""),
    operatingCities: stringArray(source, "operatingCities"),
    logoUrl: stringOr(source, "logoUrl", ""),
    email: stringOr(source, "email", ""),
    phone: stringOr(source, "phone", ""),
    director: parseDirector(source.director) ?? null,
    rating: nullableNumber(source, "rating"),
    ratingCount: optionalNumber(source, "ratingCount") ?? 0,
    myRating: nullableNumber(source, "myRating"),
  };
}

function parseRatingResult(data: unknown): RatingResult {
  const source = object(data, "rating");
  return {
    myRating: nullableNumber(source, "myRating"),
    rating: nullableNumber(source, "rating"),
    ratingCount: number(source, "ratingCount"),
  };
}

function parseTopRatedCompany(value: unknown): TopRatedCompany {
  const source = object(value, "company");
  return {
    id: string(source, "id"),
    companyName: stringOr(source, "companyName", ""),
    logoUrl: stringOr(source, "logoUrl", ""),
    rating: number(source, "rating"),
  };
}

export function parseTopRatedCompanies(data: unknown): TopRatedCompany[] {
  return array(object(data, "companies").items, "items", parseTopRatedCompany);
}

export function putRating(companyId: string, stars: number): Promise<RatingResult> {
  return api(companyPath(companyId, "rating"), parseRatingResult, { method: "PUT", body: { stars } });
}

export function deleteRating(companyId: string): Promise<RatingResult> {
  return api(companyPath(companyId, "rating"), parseRatingResult, { method: "DELETE" });
}

export function getMyCompanyProfile(id: string, signal?: AbortSignal): Promise<PublicCompany> {
  return api(companyPath(id, "profile"), parsePublicCompany, { signal, cache: "no-store" });
}
