import { routes, withQuery } from "@/lib/routes";
import { formatDate } from "@/lib/vacancy";
import { PAGE_MAX, pick, positiveInt, type RawSearchParams } from "@/lib/vacancyQuery";
import type { MyPublicationsQuery, Publication, PublicationStatus } from "@/types";

export const PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  "pending",
  "published",
  "rejected",
  "closed",
  "expired",
];

export const ACTIVE_PUBLICATION_STATUSES: readonly PublicationStatus[] = ["pending", "published", "rejected"];

export const MAX_ACTIVE_PUBLICATIONS = 3;

export const MY_PUBLICATIONS_PAGE_SIZE = 10;

export const PUBLICATION_LIMITS = {
  title: 128,
  about: 3000,
  aboutWords: 500,
  category: 64,
  location: 128,
  locations: 10,
  skill: 50,
  skills: 20,
  experienceMax: 60,
} as const;

export const PUBLICATION_FILE_MAX_MB = 2;

export const CONTACT_NOTE = "Companies can invite you; your email and phone are shared only if you accept.";

export const REVIEW_NOTE = "Changes need a new admin review; meanwhile companies cannot see this publication.";

export const LIMIT_REACHED = "You can have at most 3 active publications. Close or delete one first.";

const EXTEND_SOON_DAYS = 7;
const DAY_MS = 86_400_000;

export function isActivePublication(status: PublicationStatus): boolean {
  return ACTIVE_PUBLICATION_STATUSES.includes(status);
}

export function canEditPublication(publication: Pick<Publication, "status">): boolean {
  return publication.status !== "closed" && publication.status !== "expired";
}

export function canClosePublication(publication: Pick<Publication, "status">): boolean {
  return publication.status !== "closed";
}

export function canExtendPublication(publication: Pick<Publication, "status" | "expiresAt">, now: number): boolean {
  if (publication.status === "expired") return true;
  if (publication.status !== "published" || publication.expiresAt === null) return false;
  return Date.parse(publication.expiresAt) - now <= EXTEND_SOON_DAYS * DAY_MS;
}

export function editNeedsReview(publication: Pick<Publication, "status">): boolean {
  return publication.status === "published" || publication.status === "rejected";
}

export function publicationTiming(
  publication: Pick<Publication, "status" | "expiresAt" | "timerPaused">,
): string {
  const { status, expiresAt, timerPaused } = publication;
  if (status === "closed") return "Closed for good. It no longer counts toward your 3 active publications.";
  if (status === "expired") {
    return expiresAt ? `Expired on ${formatDate(expiresAt)}. Extend it to show it again.` : "Expired. Extend it to show it again.";
  }
  if (timerPaused) return "Timer paused during review";
  if (status === "published" && expiresAt) return `Visible until ${formatDate(expiresAt)}`;
  if (status === "pending") return "Waiting for review. Its 60 days start when our team approves it.";
  return "Not visible to companies until it is approved.";
}

export const REJECTED_NOTE = "Edit and resend it, or delete it to free a slot.";

export function parseMyPublicationsQuery(params: RawSearchParams): MyPublicationsQuery {
  return {
    status: pick(params.status, PUBLICATION_STATUSES),
    page: positiveInt(params.page, PAGE_MAX) ?? 1,
  };
}

export function myPublicationsHref(query: MyPublicationsQuery): string {
  return withQuery(routes.publications, {
    status: query.status,
    page: query.page <= 1 ? undefined : String(query.page),
  });
}
