import { applicantsHref } from "@/lib/applicantQuery";
import { myApplicationsHref } from "@/lib/applicationQuery";
import { inboxHref, sentInvitationsHref } from "@/lib/invitations";
import { ownVacancyHref, publicationHref, routes } from "@/lib/routes";
import { formatDateTime } from "@/lib/vacancy";
import type { AppNotification } from "@/types";

export type NotificationTone = "positive" | "attention" | "info";

export const BADGE_REFRESH_MS = 5 * 60 * 1000;

export const WARN_DAYS = 5;

export function badgeLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}

function quoted(title: string | undefined, fallback = "your vacancy"): string {
  return title?.trim() || fallback;
}

function publicationName(title: string | undefined): string {
  const trimmed = title?.trim();
  return trimmed ? `Your publication ${trimmed}` : "Your publication";
}

function invitationAcceptedText(title: string, data: AppNotification["data"]): string {
  if (data.alreadyApplied) return `Your invitation for ${title} was accepted; the applicant had already applied`;
  if (data.isReapply) return `Your invitation was accepted: reapplication for ${title}`;
  return `Your invitation was accepted: new application for ${title}`;
}

export function notificationText(notification: AppNotification): string {
  const { data } = notification;
  const title = quoted(data.vacancyTitle);
  switch (notification.type) {
    case "newApplication":
      return data.isReapply ? `New reapplication for ${title}` : `New application for ${title}`;
    case "applicationWithdrawn":
      return `An applicant withdrew from ${title}`;
    case "vacancyApproved":
      return `${title} is published`;
    case "vacancyRejected":
      return data.reason ? `${title} was not approved: ${data.reason}` : `${title} was not approved`;
    case "companyApproved":
      return "Your company is approved";
    case "companyRevoked":
      return "Your company approval was revoked";
    case "planEnded":
      return `Your ${data.planName ?? "paid"} plan has ended`;
    case "planPaymentActionRequired":
      return `Your bank needs a confirmation for your ${data.planName ?? "plan"} renewal. Check your email within 5 days to keep your plan.`;
    case "applicationStatusChanged": {
      const company = data.companyName?.trim() || "The company";
      const status = data.status ?? "a new status";
      return `${company} moved your application for ${title} to ${status}`;
    }
    case "applicantCompanyRevoked":
      return `${data.companyName?.trim() || "A company"} is no longer approved; your applications to it are on hold`;
    case "publicationApproved":
      return `${publicationName(data.publicationTitle)} is published`;
    case "publicationRejected": {
      const base = `${publicationName(data.publicationTitle)} was not approved`;
      return data.reason ? `${base}: ${data.reason}` : base;
    }
    case "invitationReceived":
      return `${data.companyName?.trim() || "A company"} invited you to apply to ${quoted(data.vacancyTitle, "a vacancy")}`;
    case "invitationAccepted":
      return invitationAcceptedText(title, data);
    case "invitationDeclined":
      return `Your invitation for ${title} was declined`;
  }
}

export function notificationTone(notification: AppNotification): NotificationTone {
  switch (notification.type) {
    case "vacancyApproved":
    case "companyApproved":
    case "publicationApproved":
    case "invitationReceived":
    case "invitationAccepted":
      return "positive";
    case "applicationStatusChanged":
      return notification.data.status === "rejected" ? "attention" : "positive";
    case "newApplication":
    case "applicationWithdrawn":
    case "invitationDeclined":
      return "info";
    default:
      return "attention";
  }
}

export interface NotificationTarget {
  href: string | null;
  checkVacancyId: string | null;
  checkPublicationId?: string;
}

export function notificationTarget(notification: AppNotification): NotificationTarget {
  const { vacancyId, applicationId, publicationId, invitationId } = notification.target;
  switch (notification.type) {
    case "newApplication":
    case "applicationWithdrawn":
    case "invitationAccepted":
      return vacancyId
        ? { href: applicantsHref(vacancyId, { focus: applicationId ?? undefined }), checkVacancyId: vacancyId }
        : { href: null, checkVacancyId: null };
    case "vacancyApproved":
    case "vacancyRejected":
      return vacancyId ? { href: ownVacancyHref(vacancyId), checkVacancyId: vacancyId } : { href: null, checkVacancyId: null };
    case "companyApproved":
    case "companyRevoked":
      return { href: routes.dashboard, checkVacancyId: null };
    case "planEnded":
    case "planPaymentActionRequired":
      return { href: routes.billing, checkVacancyId: null };
    case "applicationStatusChanged":
      return { href: myApplicationsHref({ focus: applicationId ?? undefined }), checkVacancyId: null };
    case "applicantCompanyRevoked":
      return { href: routes.myApplications, checkVacancyId: null };
    case "publicationApproved":
    case "publicationRejected":
      return publicationId
        ? { href: publicationHref(publicationId), checkVacancyId: null, checkPublicationId: publicationId }
        : { href: null, checkVacancyId: null };
    case "invitationReceived":
      return { href: inboxHref({ focus: invitationId ?? undefined }), checkVacancyId: null };
    case "invitationDeclined":
      return { href: sentInvitationsHref({ vacancyId: vacancyId ?? undefined }), checkVacancyId: null };
  }
}

function hoursText(hours: number | null, frozen: boolean): string {
  if (hours === null || hours === 0) return frozen ? "less than an hour left" : "less than an hour";
  const unit = hours === 1 ? "hour" : "hours";
  return frozen ? `${hours} ${unit} left` : `${hours} ${unit}`;
}

export function countdownText(notification: AppNotification): string {
  const { daysLeft, hoursLeft, locked } = notification;
  if (locked) {
    const left = daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left` : hoursText(hoursLeft, true);
    const since = notification.lockedAt ? `, locked since ${formatDateTime(notification.lockedAt)}` : "";
    return `Frozen, ${left}${since}`;
  }
  if (daysLeft > 0) return `Deleted in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
  if (hoursLeft !== null && hoursLeft > 0) return `Deleted in ${hoursText(hoursLeft, false)}`;
  return "Deleted in less than an hour";
}

export function showsExpiryWarning(notification: AppNotification): boolean {
  return !notification.locked && notification.daysLeft <= WARN_DAYS;
}
