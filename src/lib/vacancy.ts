import type {
  Currency,
  EmploymentType,
  AdminVacancyStatus,
  UserVacancyStatus,
  Vacancy,
  VacancySort,
  VacancyStatus,
  WorkMode,
} from "@/types";

export const WORK_MODES: readonly WorkMode[] = ["remote", "onsite", "hybrid"];

export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  "full-time",
  "part-time",
  "internship",
  "temporary",
];

export const CURRENCIES: readonly Currency[] = ["GEL", "USD", "EUR"];

export const ADMIN_VACANCY_STATUSES: readonly AdminVacancyStatus[] = [
  "pending",
  "published",
  "rejected",
  "closed",
  "expired",
];

export const VACANCY_STATUSES: readonly VacancyStatus[] = ["notSubmitted", ...ADMIN_VACANCY_STATUSES];

export const USER_VACANCY_STATUSES: readonly UserVacancyStatus[] = [
  "published",
  "expired",
  "closed",
  "unavailable",
];

export const VACANCY_SORTS: readonly VacancySort[] = [
  "-date",
  "date",
  "-salary",
  "salary",
  "deadline",
  "-deadline",
];

export const DEFAULT_SORT: VacancySort = "-date";

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  temporary: "Temporary",
};

export const SORT_LABELS: Record<VacancySort, string> = {
  "-date": "Newest first",
  date: "Oldest first",
  "-salary": "Highest pay",
  salary: "Lowest pay",
  deadline: "Closing soonest",
  "-deadline": "Closing latest",
};

export const PAST_SORTS = ["-deadline", "-date"] as const satisfies readonly VacancySort[];

export const PAST_SORT_LABELS = {
  "-deadline": "Ended recently",
  "-date": "Posted newest",
} as const satisfies Record<(typeof PAST_SORTS)[number], string>;

const LOCALE = "en-GB";
const TIME_ZONE = "Asia/Tbilisi";
const DAY_MS = 86_400_000;
const SOON_DAYS = 3;

const amountFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

export const NEGOTIABLE = "Negotiable";

export interface SalaryRange {
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: Currency;
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${amountFormat.format(amount)} ${currency}`;
}

export function formatSalary({ salaryMin, salaryMax, currency }: SalaryRange): string | null {
  const hasMin = salaryMin !== undefined && salaryMin !== null;
  const hasMax = salaryMax !== undefined && salaryMax !== null;
  if (hasMin && hasMax) {
    const low = Math.min(salaryMin, salaryMax);
    const high = Math.max(salaryMin, salaryMax);
    if (low === high) return formatMoney(low, currency);
    return `${amountFormat.format(low)} - ${amountFormat.format(high)} ${currency}`;
  }
  if (hasMin) return `From ${formatMoney(salaryMin, currency)}`;
  if (hasMax) return `Up to ${formatMoney(salaryMax, currency)}`;
  return null;
}

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

function dayNumber(time: number): number {
  const [year, month, day] = dayKeyFormat.format(time).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

export type DeadlineTone = "open" | "soon" | "ended";

export interface DeadlineInfo {
  label: string;
  tone: DeadlineTone;
}

export function deadlineInfo(
  vacancy: { deadline: string; status: VacancyStatus | UserVacancyStatus },
  now: number,
): DeadlineInfo {
  if (vacancy.status === "closed") return { label: "Closed", tone: "ended" };
  const deadline = Date.parse(vacancy.deadline);
  if (vacancy.status === "expired" || deadline <= now) {
    return { label: `Expired ${formatDate(vacancy.deadline)}`, tone: "ended" };
  }
  const days = dayNumber(deadline) - dayNumber(now);
  if (days <= 0) return { label: "Closes today", tone: "soon" };
  return {
    label: `Closes in ${days} ${days === 1 ? "day" : "days"}`,
    tone: days <= SOON_DAYS ? "soon" : "open",
  };
}

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

const TBILISI_OFFSET = "+04:00";

export function tbilisiDay(time: number): string {
  return dayKeyFormat.format(time);
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10);
}

export function endOfTbilisiDay(day: string): string {
  return new Date(`${day}T23:59:59.999${TBILISI_OFFSET}`).toISOString();
}

export function formatDay(day: string): string {
  return formatDate(endOfTbilisiDay(day));
}

export const STATUS_LABELS: Record<VacancyStatus, string> = {
  notSubmitted: "Not submitted",
  pending: "In review",
  published: "Live",
  rejected: "Rejected",
  closed: "Closed",
  expired: "Expired",
};

export function isFinal(status: VacancyStatus): boolean {
  return status === "closed" || status === "expired";
}

export function canClose(vacancy: Pick<Vacancy, "status" | "deadline">, now: number): boolean {
  return vacancy.status === "published" && Date.parse(vacancy.deadline) > now;
}

export function placeLabel(vacancy: Pick<Vacancy, "location" | "workMode">): string {
  const mode = WORK_MODE_LABELS[vacancy.workMode];
  const location = vacancy.location.trim();
  if (!location) return mode;
  return `${location} · ${mode}`;
}

export function summary(text: string, limit = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export function canReview(vacancy: Pick<Vacancy, "status" | "deadline">, now: number): boolean {
  return vacancy.status === "pending" && Date.parse(vacancy.deadline) > now;
}
