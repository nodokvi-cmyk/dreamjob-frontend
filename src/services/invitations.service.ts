import { INVITATION_STATUSES } from "@/lib/invitations";
import {
  booleanOr,
  isoDate,
  nullableIsoDate,
  number,
  object,
  oneOf,
  pageParser,
  string,
  stringOr,
  type JsonObject,
} from "@/lib/decode";
import { USER_VACANCY_STATUSES } from "@/lib/vacancy";
import { api } from "@/services/api";
import { parseApplication } from "@/services/applications.service";
import { parseApplicationMark } from "@/services/vacancies.service";
import type {
  AcceptResult,
  InboxInvitation,
  InboxQuery,
  Invitation,
  InvitationQuota,
  Paginated,
  SentInvitation,
  SentInvitationsQuery,
} from "@/types";

function nullableString(source: JsonObject, key: string): string | null {
  const value = source[key];
  if (value === null || value === undefined) return null;
  return string(source, key);
}

function baseFields(source: JsonObject) {
  return {
    id: string(source, "id"),
    status: oneOf(source, "status", INVITATION_STATUSES),
    message: stringOr(source, "message", ""),
    createdAt: isoDate(source, "createdAt"),
    respondedAt: nullableIsoDate(source, "respondedAt"),
  };
}

export function parseInvitation(data: unknown): Invitation {
  const source = object(data, "invitation");
  return {
    ...baseFields(source),
    publication: string(source, "publication"),
    vacancy: string(source, "vacancy"),
    company: string(source, "company"),
    applicationId: nullableString(source, "applicationId"),
  };
}

function idTitle(value: unknown, path: string): { id: string; title: string } | null {
  if (value === null || value === undefined) return null;
  const source = object(value, path);
  return { id: string(source, "id"), title: stringOr(source, "title", "") };
}

function parseSent(data: unknown): SentInvitation {
  const source = object(data, "invitation");
  return {
    ...baseFields(source),
    company: string(source, "company"),
    applicationId: nullableString(source, "applicationId"),
    vacancy: idTitle(source.vacancy, "vacancy"),
    publication: idTitle(source.publication, "publication"),
    publicationAvailable: booleanOr(source, "publicationAvailable", false),
  };
}

function parseInboxVacancy(value: unknown): InboxInvitation["vacancy"] {
  if (value === null || value === undefined) return null;
  const source = object(value, "vacancy");
  return {
    id: string(source, "id"),
    title: stringOr(source, "title", ""),
    deadline: isoDate(source, "deadline"),
    status: oneOf(source, "status", USER_VACANCY_STATUSES),
  };
}

function parseInbox(data: unknown): InboxInvitation {
  const source = object(data, "invitation");
  const company = object(source.company, "company");
  return {
    ...baseFields(source),
    publication: idTitle(source.publication, "publication"),
    vacancy: parseInboxVacancy(source.vacancy),
    company: {
      id: string(company, "id"),
      companyName: stringOr(company, "companyName", ""),
      logoUrl: stringOr(company, "logoUrl", ""),
      approved: booleanOr(company, "approved", false),
    },
    application: parseApplicationMark(source.application),
  };
}

function parseQuota(data: unknown): InvitationQuota {
  const source = object(data, "quota");
  return { used: number(source, "used"), limit: number(source, "limit"), resetsAt: isoDate(source, "resetsAt") };
}

function parseAccept(data: unknown): AcceptResult {
  const source = object(data, "accept");
  return {
    invitation: source.invitation === null || source.invitation === undefined ? null : parseInvitation(source.invitation),
    application: parseApplication(source.application),
  };
}

const parseSentPage = pageParser("invitations", parseSent);
const parseInboxPage = pageParser("invitations", parseInbox);

function search(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

function invitationPath(id: string, action?: string): string {
  const base = `/invitations/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

export function invitePublication(publicationId: string, vacancyId: string, message: string): Promise<Invitation> {
  const body = message ? { vacancyId, message } : { vacancyId };
  return api(`/publications/${encodeURIComponent(publicationId)}/invitations`, parseInvitation, {
    method: "POST",
    body,
  });
}

export function cancelInvitation(id: string): Promise<Invitation> {
  return api(invitationPath(id), parseInvitation, { method: "DELETE" });
}

export function getInvitationQuota(signal?: AbortSignal): Promise<InvitationQuota> {
  return api("/invitations/quota", parseQuota, { signal, cache: "no-store" });
}

export function listSentInvitations(
  query: SentInvitationsQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<SentInvitation>> {
  const values = { status: query.status, vacancyId: query.vacancyId, page: query.page, take };
  return api(`/invitations/sent?${search(values)}`, parseSentPage, { signal, cache: "no-store" });
}

export function listMyInvitations(
  query: InboxQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<InboxInvitation>> {
  const values = { status: query.status, vacancyId: query.vacancyId, focus: query.focus, page: query.page, take };
  return api(`/invitations/mine?${search(values)}`, parseInboxPage, { signal, cache: "no-store" });
}

export function acceptInvitation(id: string): Promise<AcceptResult> {
  return api(invitationPath(id, "accept"), parseAccept, { method: "PATCH" });
}

export function declineInvitation(id: string): Promise<Invitation> {
  return api(invitationPath(id, "decline"), parseInvitation, { method: "PATCH" });
}
