import { APPLICATION_STATUSES } from "@/lib/applications";
import {
  array,
  boolean,
  isObject,
  isoDate,
  nullableIsoDate,
  number,
  object,
  oneOf,
  optionalNumber,
  optionalOneOf,
  optionalString,
  pageShape,
  string,
  type JsonObject,
} from "@/lib/decode";
import { api } from "@/services/api";
import type {
  AppNotification,
  NotificationData,
  NotificationPage,
  NotificationTarget,
  NotificationType,
} from "@/types";

export const NOTIFICATION_PAGE_SIZE = 5;

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "newApplication",
  "applicationWithdrawn",
  "vacancyApproved",
  "vacancyRejected",
  "companyApproved",
  "companyRevoked",
  "planEnded",
  "planPaymentActionRequired",
  "applicationStatusChanged",
  "applicantCompanyRevoked",
  "publicationApproved",
  "publicationRejected",
  "invitationReceived",
  "invitationAccepted",
  "invitationDeclined",
];

function optionalBoolean(source: JsonObject, key: string): boolean | undefined {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  return boolean(source, key);
}

function parseData(value: unknown): NotificationData {
  if (!isObject(value)) return {};
  return {
    vacancyTitle: optionalString(value, "vacancyTitle"),
    companyName: optionalString(value, "companyName"),
    status: optionalOneOf(value, "status", APPLICATION_STATUSES),
    reason: optionalString(value, "reason"),
    planName: optionalString(value, "planName"),
    isReapply: optionalBoolean(value, "isReapply"),
    publicationTitle: optionalString(value, "publicationTitle"),
    alreadyApplied: optionalBoolean(value, "alreadyApplied"),
  };
}

function parseTarget(value: unknown): NotificationTarget {
  if (!isObject(value)) return { vacancyId: null, applicationId: null, publicationId: null, invitationId: null };
  return {
    vacancyId: optionalString(value, "vacancyId") ?? null,
    applicationId: optionalString(value, "applicationId") ?? null,
    publicationId: optionalString(value, "publicationId") ?? null,
    invitationId: optionalString(value, "invitationId") ?? null,
  };
}

export function parseNotification(data: unknown): AppNotification {
  const source = object(data, "notification");
  return {
    id: string(source, "id"),
    type: oneOf(source, "type", NOTIFICATION_TYPES),
    read: boolean(source, "read"),
    createdAt: isoDate(source, "createdAt"),
    data: parseData(source.data),
    target: parseTarget(source.target),
    locked: boolean(source, "locked"),
    expiresAt: nullableIsoDate(source, "expiresAt"),
    lockedAt: nullableIsoDate(source, "lockedAt"),
    daysLeft: number(source, "daysLeft"),
    hoursLeft: optionalNumber(source, "hoursLeft") ?? null,
  };
}

function parseNotificationPage(data: unknown): NotificationPage {
  const source = object(data, "notifications");
  return {
    items: array(source.items, "items", parseNotification),
    ...pageShape(source),
    unreadCount: number(source, "unreadCount"),
  };
}

function parseUnseen(data: unknown): number {
  return number(object(data, "badge"), "unseenCount");
}

function parseDeleted(data: unknown): number {
  return number(object(data, "notifications"), "deleted");
}

function notificationPath(id: string, action?: string): string {
  const base = `/notifications/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

export function getUnseenCount(signal?: AbortSignal): Promise<number> {
  return api("/notifications/badge", parseUnseen, { signal, cache: "no-store" });
}

export function markNotificationsSeen(): Promise<number> {
  return api("/notifications/seen", parseUnseen, { method: "PATCH" });
}

export function listNotifications(page: number, signal?: AbortSignal): Promise<NotificationPage> {
  const search = new URLSearchParams({ page: String(page), take: String(NOTIFICATION_PAGE_SIZE) });
  return api(`/notifications?${search.toString()}`, parseNotificationPage, {
    signal,
    cache: "no-store",
  });
}

export function markNotificationRead(id: string): Promise<AppNotification> {
  return api(notificationPath(id, "read"), parseNotification, { method: "PATCH" });
}

export function setNotificationLock(id: string, locked: boolean): Promise<AppNotification> {
  return api(notificationPath(id, "lock"), parseNotification, { method: "PATCH", body: { locked } });
}

export function deleteNotification(id: string): Promise<AppNotification> {
  return api(notificationPath(id), parseNotification, { method: "DELETE" });
}

export function clearNotifications(): Promise<number> {
  return api("/notifications", parseDeleted, { method: "DELETE" });
}
