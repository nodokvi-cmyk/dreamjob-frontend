"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoad } from "@/components/dashboard/useLoad";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { pageCount } from "@/components/vacancies/Pagination";
import { formError } from "@/lib/errors";
import { notificationTarget } from "@/lib/notifications";
import { ApiError } from "@/services/api";
import {
  clearNotifications,
  deleteNotification,
  listNotifications,
  markNotificationRead,
  setNotificationLock,
} from "@/services/notifications.service";
import { getOwnVacancy } from "@/services/vacancies.service";
import type { AppNotification } from "@/types";

interface NotificationPanelProps {
  accountId: string;
  role: "user" | "company";
  onNavigate: () => void;
}

const GONE = "This item no longer exists.";

export function NotificationPanel({ accountId, role, onNavigate }: NotificationPanelProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { state, reload } = useLoad(`${accountId}:${page}`, (signal) => listNotifications(page, signal));
  const [patched, setPatched] = useState<{ key: string; items: ReadonlyMap<string, AppNotification> }>({
    key: "",
    items: new Map(),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const loadKey = `${accountId}:${page}`;
  const overrides = patched.key === loadKey ? patched.items : null;

  function patch(item: AppNotification) {
    setPatched((current) => {
      const base = current.key === loadKey ? current.items : new Map<string, AppNotification>();
      return { key: loadKey, items: new Map(base).set(item.id, item) };
    });
  }

  function afterRemoval(remaining: number) {
    if (remaining === 0 && page > 1) setPage(page - 1);
    else reload();
  }

  async function open(item: AppNotification) {
    setMessage(null);
    if (!item.read) {
      markNotificationRead(item.id).then(patch, () => undefined);
      patch({ ...item, read: true });
    }
    const target = notificationTarget(item);
    if (!target.href) return;
    if (target.checkVacancyId && role === "company") {
      try {
        await getOwnVacancy(target.checkVacancyId, accountId);
      } catch (error: unknown) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 403 || error.status === 400)) {
          setMessage(GONE);
          return;
        }
      }
    }
    onNavigate();
    router.push(target.href);
  }

  async function toggleLock(item: AppNotification) {
    setMessage(null);
    try {
      patch(await setNotificationLock(item.id, !item.locked));
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setMessage("It changed in another tab. The list is up to date now.");
        reload();
        return;
      }
      if (error instanceof ApiError && error.status === 404) {
        setMessage(GONE);
        reload();
        return;
      }
      setMessage(formError(error).message);
    }
  }

  async function remove(item: AppNotification, remaining: number) {
    setMessage(null);
    try {
      await deleteNotification(item.id);
    } catch (error: unknown) {
      if (!(error instanceof ApiError && error.status === 404)) {
        setMessage(formError(error).message);
        return;
      }
    }
    afterRemoval(remaining);
  }

  async function clearAll() {
    setBusy(true);
    setMessage(null);
    try {
      const deleted = await clearNotifications();
      setMessage(deleted === 0 ? "Nothing to clear. Locked notifications stay." : `Cleared ${deleted}. Locked notifications stay.`);
      setConfirmClear(false);
      if (page > 1) setPage(1);
      else reload();
    } catch (error: unknown) {
      setMessage(formError(error).message);
    } finally {
      setBusy(false);
    }
  }

  const data = state.status === "ready" ? state.data : null;
  const items = data ? data.items.map((item) => overrides?.get(item.id) ?? item) : [];
  const pages = data ? pageCount(data.total, data.take) : 1;

  return (
    <div className="flex max-h-[min(36rem,calc(100dvh-6rem))] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col">
          <h2 className="font-display text-lg leading-none font-bold uppercase">Notifications</h2>
          {data ? (
            <p className="mt-1 text-sm text-muted-foreground tabular">
              {data.unreadCount === 0 ? "All read" : `${data.unreadCount} unread`}
            </p>
          ) : null}
        </div>
        {data && data.total > 0 ? (
          confirmClear ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">Clear unlocked?</span>
              <Button type="button" size="xs" variant="destructive" disabled={busy} onClick={clearAll}>
                {busy ? "Clearing" : "Clear"}
              </Button>
              <Button type="button" size="xs" variant="ghost" disabled={busy} onClick={() => setConfirmClear(false)}>
                Keep
              </Button>
            </div>
          ) : (
            <Button type="button" size="xs" variant="ghost" onClick={() => setConfirmClear(true)}>
              Clear all
            </Button>
          )
        ) : null}
      </div>

      <p aria-live="polite" className={message ? "border-b border-border bg-muted/60 px-4 py-2 text-sm" : "sr-only"}>
        {message ?? ""}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={state.status === "loading"}>
        {state.status === "loading" ? (
          <ul role="status" aria-label="Loading notifications" className="flex flex-col">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="flex gap-3 border-b border-border px-4 py-3.5">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        ) : state.status === "failed" ? (
          <div className="flex flex-col items-start gap-3 px-4 py-6">
            <p className="text-sm">{formError(state.error).message}</p>
            <Button type="button" size="sm" variant="outline" onClick={reload}>
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[0.95rem] text-muted-foreground">
            {page > 1 ? "Nothing on this page." : "No notifications. You're all caught up."}
          </p>
        ) : (
          <ul className="flex flex-col">
            {items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onOpen={() => void open(item)}
                onToggleLock={() => void toggleLock(item)}
                onDelete={() => void remove(item, items.length - 1)}
              />
            ))}
          </ul>
        )}
      </div>

      {data && pages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
          <Button type="button" variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeftIcon aria-hidden />
            Newer
          </Button>
          <span className="text-sm text-muted-foreground tabular">
            Page {page} of {pages}
          </span>
          <Button type="button" variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Older
            <ChevronRightIcon aria-hidden />
          </Button>
        </div>
      ) : null}
      <p className="sr-only">Notifications are deleted 30 days after they arrive unless you lock them.</p>
    </div>
  );
}
