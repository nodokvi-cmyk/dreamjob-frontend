"use client";

import { BellIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BADGE_REFRESH_MS, badgeLabel } from "@/lib/notifications";
import { getUnseenCount, markNotificationsSeen } from "@/services/notifications.service";

const NotificationPanel = dynamic(
  () => import("@/components/notifications/NotificationPanel").then((module) => module.NotificationPanel),
  {
    loading: () => (
      <p role="status" className="px-4 py-8 text-center text-sm text-muted-foreground">
        Loading…
      </p>
    ),
  },
);

function useUnseenBadge(accountId: string) {
  const [count, setCount] = useState(0);
  const lastFetch = useRef(0);

  const fetchNow = useEffectEvent(() => {
    lastFetch.current = Date.now();
    getUnseenCount().then(setCount, () => undefined);
  });

  useEffect(() => {
    fetchNow();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchNow();
    }, BADGE_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetch.current >= BADGE_REFRESH_MS) fetchNow();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [accountId]);

  const clear = useCallback(() => {
    setCount(0);
    markNotificationsSeen().then(setCount, () => undefined);
  }, []);

  return { count, clear };
}

export function NotificationBell({ accountId, role }: { accountId: string; role: "user" | "company" }) {
  const { count, clear } = useUnseenBadge(accountId);
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) clear();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded-lg border border-enamel-seam text-on-enamel transition-colors outline-none hover:bg-enamel-raised focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-enamel-raised"
        >
          <BellIcon aria-hidden className="size-5" />
          <span className="sr-only">Notifications{count > 0 ? `, ${badgeLabel(count)} new` : ""}</span>
          {count > 0 ? (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-line-scarlet px-1 text-[0.7rem] leading-none font-bold text-white tabular ring-2 ring-enamel"
            >
              {badgeLabel(count)}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(26rem,calc(100vw-1.5rem))] p-0">
        <NotificationPanel accountId={accountId} role={role} onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
