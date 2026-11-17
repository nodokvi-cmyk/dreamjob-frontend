import {
  ACTIVE_PUBLICATION_STATUSES,
  PUBLICATION_STATUSES,
} from "@/lib/publications";
import {
  DecodeError,
  booleanOr,
  isoDate,
  nullableIsoDate,
  object,
  oneOf,
  optionalNumber,
  pageParser,
  string,
  stringArray,
  stringOr,
  type JsonObject,
} from "@/lib/decode";
import { CURRENCIES, EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/vacancy";
import { api } from "@/services/api";
import { parseCvLink } from "@/services/users.service";
import { boardApiSearch } from "@/lib/board";
import type {
  AdminPublicationsQuery,
  BoardQuery,
  CompanyPublication,
  CvLink,
  InvitationState,
  PublicationAuthor,
  PublicationCard,
  MyPublicationsQuery,
  Paginated,
  Publication,
  PublicationInput,
  PublicationStatus,
  PublicationUpdateInput,
} from "@/types";

function publicationPath(id: string, action?: string): string {
  const base = `/publications/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

export function enumArray<T extends string>(source: JsonObject, key: string, allowed: readonly T[]): T[] {
  return stringArray(source, key).map((value, index) => {
    const match = allowed.find((option) => option === value);
    if (match === undefined) throw new DecodeError(`${key}[${index}]`);
    return match;
  });
}

function nullableNumber(source: JsonObject, key: string): number | null {
  return optionalNumber(source, key) ?? null;
}

export function parsePublicationFields(source: JsonObject): Omit<Publication, "rejectionReason" | "timerPaused" | "updatedAt"> {
  return {
    id: string(source, "id"),
    user: string(source, "user"),
    title: string(source, "title"),
    about: stringOr(source, "about", ""),
    category: stringOr(source, "category", ""),
    employmentTypes: enumArray(source, "employmentTypes", EMPLOYMENT_TYPES),
    workModes: enumArray(source, "workModes", WORK_MODES),
    locations: stringArray(source, "locations"),
    salaryMin: nullableNumber(source, "salaryMin"),
    salaryMax: nullableNumber(source, "salaryMax"),
    currency: oneOf(source, "currency", CURRENCIES),
    skills: stringArray(source, "skills"),
    experienceYears: nullableNumber(source, "experienceYears"),
    acceptingInvites: booleanOr(source, "acceptingInvites", true),
    hasCv: booleanOr(source, "hasCv", false),
    hasCoverLetter: booleanOr(source, "hasCoverLetter", false),
    status: oneOf(source, "status", PUBLICATION_STATUSES),
    expiresAt: nullableIsoDate(source, "expiresAt"),
    createdAt: isoDate(source, "createdAt"),
  };
}

export function parsePublication(data: unknown): Publication {
  const source = object(data, "publication");
  return {
    ...parsePublicationFields(source),
    rejectionReason: stringOr(source, "rejectionReason", ""),
    timerPaused: booleanOr(source, "timerPaused", false),
    updatedAt: isoDate(source, "updatedAt"),
  };
}

const parsePublicationPage = pageParser("publications", parsePublication);

export const INVITATION_STATES: readonly InvitationState[] = ["none", "invited", "accepted", "declined"];

export function parseAuthor(value: unknown): PublicationAuthor | null {
  if (value === null || value === undefined) return null;
  const source = object(value, "author");
  return {
    id: string(source, "id"),
    firstName: stringOr(source, "firstName", ""),
    lastName: stringOr(source, "lastName", ""),
    avatarUrl: stringOr(source, "avatarUrl", ""),
  };
}

function nullableString(source: JsonObject, key: string): string | null {
  const value = source[key];
  if (value === null || value === undefined) return null;
  return string(source, key);
}

export function parsePublicationCard(data: unknown): PublicationCard {
  const source = object(data, "publication");
  return {
    id: string(source, "id"),
    title: string(source, "title"),
    excerpt: stringOr(source, "excerpt", ""),
    category: stringOr(source, "category", ""),
    employmentTypes: enumArray(source, "employmentTypes", EMPLOYMENT_TYPES),
    workModes: enumArray(source, "workModes", WORK_MODES),
    locations: stringArray(source, "locations"),
    salaryMin: nullableNumber(source, "salaryMin"),
    salaryMax: nullableNumber(source, "salaryMax"),
    currency: oneOf(source, "currency", CURRENCIES),
    skills: stringArray(source, "skills"),
    experienceYears: nullableNumber(source, "experienceYears"),
    hasCv: booleanOr(source, "hasCv", false),
    hasCoverLetter: booleanOr(source, "hasCoverLetter", false),
    expiresAt: nullableIsoDate(source, "expiresAt"),
    createdAt: isoDate(source, "createdAt"),
    author: parseAuthor(source.author),
    invitation: oneOf(source, "invitation", INVITATION_STATES),
  };
}

function parseCompanyPublication(data: unknown): CompanyPublication {
  const source = object(data, "publication");
  return {
    ...parsePublicationFields(source),
    author: parseAuthor(source.author),
    invitation: oneOf(source, "invitation", INVITATION_STATES),
    invitationId: nullableString(source, "invitationId"),
    invitedVacancyId: nullableString(source, "invitedVacancyId"),
  };
}

const parseBoardPage = pageParser("board", parsePublicationCard);

export function listBoard(query: BoardQuery, take: number, signal?: AbortSignal): Promise<Paginated<PublicationCard>> {
  return api(`/publications?${boardApiSearch(query, take)}`, parseBoardPage, { signal, cache: "no-store" });
}

export function getCompanyPublication(id: string, signal?: AbortSignal): Promise<CompanyPublication> {
  return api(publicationPath(id), parseCompanyPublication, { signal, cache: "no-store" });
}

function countOnly(data: unknown): number {
  return pageParser("publications", () => null)(data).total;
}

function search(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function listMyPublications(
  query: MyPublicationsQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<Publication>> {
  const values = { status: query.status, page: query.page, take };
  return api(`/publications/mine?${search(values)}`, parsePublicationPage, { signal, cache: "no-store" });
}

function countMine(status: PublicationStatus, signal?: AbortSignal): Promise<number> {
  return api(`/publications/mine?${search({ status, take: 1 })}`, countOnly, { signal, cache: "no-store" });
}

export async function countActivePublications(signal?: AbortSignal): Promise<number> {
  const counts = await Promise.all(ACTIVE_PUBLICATION_STATUSES.map((status) => countMine(status, signal)));
  return counts.reduce((sum, count) => sum + count, 0);
}

export function getPublication(id: string, signal?: AbortSignal): Promise<Publication> {
  return api(publicationPath(id), parsePublication, { signal, cache: "no-store" });
}

export function createPublication(input: PublicationInput): Promise<Publication> {
  return api("/publications", parsePublication, { method: "POST", body: input });
}

export function updatePublication(id: string, input: PublicationUpdateInput): Promise<Publication> {
  return api(publicationPath(id), parsePublication, { method: "PATCH", body: input });
}

export function setAcceptingInvites(id: string, acceptingInvites: boolean): Promise<Publication> {
  return api(publicationPath(id, "accepting-invites"), parsePublication, {
    method: "PATCH",
    body: { acceptingInvites },
  });
}

export function closePublication(id: string): Promise<Publication> {
  return api(publicationPath(id, "close"), parsePublication, { method: "PATCH" });
}

export function extendPublication(id: string): Promise<Publication> {
  return api(publicationPath(id, "extend"), parsePublication, { method: "POST" });
}

export function deletePublication(id: string): Promise<Publication> {
  return api(publicationPath(id), parsePublication, { method: "DELETE" });
}

export type PublicationFileKind = "cv" | "coverLetter";

const FILE_ROUTE: Record<PublicationFileKind, string> = { cv: "cv", coverLetter: "cover-letter" };

export function uploadPublicationFile(id: string, kind: PublicationFileKind, file: File): Promise<Publication> {
  const body = new FormData();
  body.append(kind, file);
  return api(publicationPath(id, FILE_ROUTE[kind]), parsePublication, { method: "PATCH", body });
}

export function removePublicationFile(id: string, kind: PublicationFileKind): Promise<Publication> {
  return api(publicationPath(id, FILE_ROUTE[kind]), parsePublication, { method: "DELETE" });
}

export function getPublicationFile(id: string, kind: PublicationFileKind): Promise<CvLink> {
  return api(publicationPath(id, FILE_ROUTE[kind]), parseCvLink, { cache: "no-store" });
}

export function listAdminPublications(
  query: AdminPublicationsQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<Publication>> {
  const values = {
    status: query.status === "all" ? undefined : query.status,
    userId: query.userId,
    sort: query.sort,
    page: query.page,
    take,
  };
  return api(`/publications/admin?${search(values)}`, parsePublicationPage, { signal, cache: "no-store" });
}

export function countPendingPublications(signal?: AbortSignal): Promise<number> {
  return api(`/publications/admin?${search({ status: "pending", take: 1 })}`, countOnly, {
    signal,
    cache: "no-store",
  });
}

function ignore(): null {
  return null;
}

export async function approvePublication(id: string): Promise<void> {
  await api(publicationPath(id, "approve"), ignore, { method: "PATCH" });
}

export async function rejectPublication(id: string, reason: string): Promise<void> {
  const body = reason ? { reason } : {};
  await api(publicationPath(id, "reject"), ignore, { method: "PATCH", body });
}
