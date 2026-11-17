import { routes, withQuery } from "@/lib/routes";
import { PAGE_MAX, first, pick, positiveInt, type RawSearchParams } from "@/lib/vacancyQuery";
import { OBJECT_ID } from "@/services/vacancies.service";
import type { InboxInvitation, InboxQuery, InvitationQuota, InvitationStatus, SentInvitationsQuery } from "@/types";

export const INVITATION_STATUSES: readonly InvitationStatus[] = ["invited", "accepted", "declined"];

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  invited: "Waiting for answer",
  accepted: "Accepted",
  declined: "Declined",
};

export const INVITATIONS_PAGE_SIZE = 10;

export const INVITE_MESSAGE_MAX_CHARS = 500;

export const INVITE_MESSAGE_MAX_WORDS = 100;

export const ACCEPT_NOTE =
  "Your email and phone number become visible to this company.";

function objectId(value: string | string[] | undefined): string | undefined {
  const text = first(value).trim();
  return OBJECT_ID.test(text) ? text : undefined;
}

export function parseSentQuery(params: RawSearchParams): SentInvitationsQuery {
  return {
    status: pick(params.status, INVITATION_STATUSES),
    vacancyId: objectId(params.vacancyId),
    page: positiveInt(params.page, PAGE_MAX) ?? 1,
  };
}

export function sentInvitationsHref(query: Partial<SentInvitationsQuery>): string {
  return withQuery(routes.sentInvitations, {
    status: query.status,
    vacancyId: query.vacancyId,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  });
}

export function parseInboxQuery(params: RawSearchParams): InboxQuery {
  return {
    status: pick(params.status, INVITATION_STATUSES),
    vacancyId: objectId(params.vacancyId),
    focus: objectId(params.focus),
    page: positiveInt(params.page, PAGE_MAX) ?? 1,
  };
}

export function inboxHref(query: Partial<InboxQuery>): string {
  return withQuery(routes.invitations, {
    status: query.status,
    vacancyId: query.vacancyId,
    focus: query.focus,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  });
}

export function invitationRowId(id: string): string {
  return `invitation-${id}`;
}

export function quotaLeft(quota: InvitationQuota): number {
  return Math.max(0, quota.limit - quota.used);
}

export function quotaText(quota: InvitationQuota): string {
  return `${quotaLeft(quota)} of ${quota.limit} invitations left this month`;
}

export function acceptBlockedReason(invitation: Pick<InboxInvitation, "vacancy" | "company" | "application">): string | null {
  const { vacancy, company, application } = invitation;
  if (!vacancy || vacancy.status === "unavailable") return "This vacancy is temporarily unavailable.";
  if (vacancy.status === "closed") return "This vacancy is closed.";
  if (vacancy.status === "expired") return "This vacancy has expired.";
  if (!company.approved) return "This company is not accepting applications right now.";
  if (application && (application.status === "rejected" || application.status === "withdrawn") && !application.canReapply) {
    return "You cannot apply to this vacancy again.";
  }
  return null;
}

export function usesReapply(invitation: Pick<InboxInvitation, "application">): "rejected" | "withdrawn" | null {
  const { application } = invitation;
  if (!application || !application.canReapply) return null;
  if (application.status === "rejected" || application.status === "withdrawn") return application.status;
  return null;
}
