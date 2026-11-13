import {
  APPLICATION_STATUSES,
  PREVIOUS_OUTCOMES,
} from "@/lib/applications";
import {
  array,
  boolean,
  booleanOr,
  isObject,
  isoDate,
  number,
  object,
  oneOf,
  optionalNumber,
  optionalOneOf,
  pageShape,
  string,
  stringOr,
  type JsonObject,
} from "@/lib/decode";
import { USER_VACANCY_STATUSES } from "@/lib/vacancy";
import { api } from "@/services/api";
import { parseCvLink } from "@/services/users.service";
import type {
  ApplicantItem,
  ApplicantsQuery,
  Application,
  ApplicationStatusChange,
  ApplyInput,
  CompanyApplicationStatus,
  CvLink,
  MyApplication,
  MyApplicationsQuery,
  Paginated,
} from "@/types";

function applicationPath(id: string, action: string): string {
  return `/applications/${encodeURIComponent(id)}/${action}`;
}

function search(values: Record<string, string | number | undefined>, take: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  params.set("take", String(take));
  return params.toString();
}

function parseApplicationFields(source: JsonObject): Omit<Application, "vacancy"> {
  return {
    id: string(source, "id"),
    status: oneOf(source, "status", APPLICATION_STATUSES),
    message: stringOr(source, "message", ""),
    hasCv: booleanOr(source, "hasCv", false),
    hasCoverLetter: booleanOr(source, "hasCoverLetter", false),
    submissions: number(source, "submissions"),
    locked: booleanOr(source, "locked", false),
    previousOutcome: optionalOneOf(source, "previousOutcome", PREVIOUS_OUTCOMES) ?? null,
    appliedAt: isoDate(source, "appliedAt"),
    firstAppliedAt: isoDate(source, "firstAppliedAt"),
  };
}

export function parseApplication(data: unknown): Application {
  const source = object(data, "application");
  return { ...parseApplicationFields(source), vacancy: string(source, "vacancy") };
}

function parseMyApplication(value: unknown): MyApplication | null {
  const source = object(value, "application");
  if (!isObject(source.vacancy)) return null;
  const vacancy = source.vacancy;
  return {
    ...parseApplicationFields(source),
    vacancy: {
      id: string(vacancy, "id"),
      title: string(vacancy, "title"),
      company: string(vacancy, "company"),
      companyName: stringOr(vacancy, "companyName", ""),
      logoUrl: stringOr(vacancy, "logoUrl", ""),
      deadline: isoDate(vacancy, "deadline"),
      status: oneOf(vacancy, "status", USER_VACANCY_STATUSES),
    },
    companyApproved: booleanOr(source, "companyApproved", false),
    canReapply: booleanOr(source, "canReapply", false),
  };
}

function parseMyApplicationPage(data: unknown): Paginated<MyApplication> {
  const source = object(data, "applications");
  const items = array(source.items, "items", parseMyApplication).filter(
    (item): item is MyApplication => item !== null,
  );
  return { items, ...pageShape(source) };
}

function parseApplicantItem(value: unknown): ApplicantItem {
  const source = object(value, "applicant");
  const base = {
    id: string(source, "id"),
    status: oneOf(source, "status", APPLICATION_STATUSES),
    appliedAt: isoDate(source, "appliedAt"),
  };
  if (boolean(source, "hidden")) return { ...base, hidden: true };
  const applicant = object(source.applicant, "applicant");
  return {
    ...base,
    hidden: false,
    firstAppliedAt: isoDate(source, "firstAppliedAt"),
    isReapply: booleanOr(source, "isReapply", false),
    previousOutcome: optionalOneOf(source, "previousOutcome", PREVIOUS_OUTCOMES) ?? null,
    message: stringOr(source, "message", ""),
    hasCv: booleanOr(source, "hasCv", false),
    hasCoverLetter: booleanOr(source, "hasCoverLetter", false),
    applicant: {
      id: string(applicant, "id"),
      firstName: string(applicant, "firstName"),
      lastName: stringOr(applicant, "lastName", ""),
      avatarUrl: stringOr(applicant, "avatarUrl", ""),
      email: stringOr(applicant, "email", ""),
      phone: stringOr(applicant, "phone", ""),
      age: optionalNumber(applicant, "age") ?? null,
    },
  };
}

function parseApplicantPage(data: unknown): Paginated<ApplicantItem> {
  const source = object(data, "applicants");
  return { items: array(source.items, "items", parseApplicantItem), ...pageShape(source) };
}

function parseStatusChange(data: unknown): ApplicationStatusChange {
  const source = object(data, "application");
  return {
    id: string(source, "id"),
    status: oneOf(source, "status", APPLICATION_STATUSES),
    appliedAt: isoDate(source, "appliedAt"),
  };
}

export function applyToVacancy(vacancyId: string, input: ApplyInput): Promise<Application> {
  const body = new FormData();
  const message = input.message?.trim();
  if (message) body.append("message", message);
  if (input.useProfileCv !== undefined) body.append("useProfileCv", String(input.useProfileCv));
  if (input.keepPrevious !== undefined) body.append("keepPrevious", String(input.keepPrevious));
  if (input.cv) body.append("cv", input.cv);
  if (input.coverLetter) body.append("coverLetter", input.coverLetter);
  return api(`/vacancies/${encodeURIComponent(vacancyId)}/applications`, parseApplication, {
    method: "POST",
    body,
  });
}

export function withdrawApplication(id: string): Promise<Application> {
  return api(applicationPath(id, "withdraw"), parseApplication, { method: "PATCH" });
}

export function listMyApplications(
  query: MyApplicationsQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<MyApplication>> {
  const values = { q: query.q, status: query.status, sort: query.sort, page: query.page };
  return api(`/applications/mine?${search(values, take)}`, parseMyApplicationPage, {
    signal,
    cache: "no-store",
  });
}

export function listApplicants(
  vacancyId: string,
  query: ApplicantsQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<ApplicantItem>> {
  const values = {
    q: query.q,
    status: query.status,
    sort: query.sort,
    page: query.page,
    focus: query.focus,
  };
  return api(
    `/vacancies/${encodeURIComponent(vacancyId)}/applications?${search(values, take)}`,
    parseApplicantPage,
    { signal, cache: "no-store" },
  );
}

export function changeApplicationStatus(
  id: string,
  status: CompanyApplicationStatus,
): Promise<ApplicationStatusChange> {
  return api(applicationPath(id, "status"), parseStatusChange, { method: "PATCH", body: { status } });
}

export function getApplicationCv(id: string): Promise<CvLink> {
  return api(applicationPath(id, "cv"), parseCvLink, { cache: "no-store" });
}

export function getApplicationCoverLetter(id: string): Promise<CvLink> {
  return api(applicationPath(id, "cover-letter"), parseCvLink, { cache: "no-store" });
}
