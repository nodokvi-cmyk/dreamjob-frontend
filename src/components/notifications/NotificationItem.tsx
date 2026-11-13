"use client";

import {
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  InboxIcon,
  InfoIcon,
  LockIcon,
  LockOpenIcon,
  ShieldOffIcon,
  TriangleAlertIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ReasonTip } from "@/components/vacancies/ReasonTip";
import {
  type NotificationTone,
  countdownText,
  notificationText,
  notificationTone,
  showsExpiryWarning,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/vacancy";
import type { AppNotification } from "@/types";

const TONE_ICON: Record<NotificationTone, string> = {
  positive: "bg-line-green/15 text-success-ink",
  attention: "bg-line-amber/20 text-foreground [&_svg]:text-[color-mix(in_oklab,var(--line-amber),black_35%)] dark:[&_svg]:text-line-amber",
  info: "bg-muted text-muted-foreground",
};

const TONE_EDGE: Record<NotificationTone, string> = {
  positive: "border-l-line-green",
  attention: "border-l-line-amber",
  info: "border-l-muted-foreground/40",
};

function NotificationIcon({ item }: { item: AppNotification }) {
  switch (item.type) {
    case "newApplication":
      return <InboxIcon strokeWidth={2.25} />;
    case "applicationWithdrawn":
      return <Undo2Icon strokeWidth={2.25} />;
    case "vacancyApproved":
    case "companyApproved":
      return <CheckIcon strokeWidth={2.25} />;
    case "vacancyRejected":
      return <XIcon strokeWidth={2.25} />;
    case "companyRevoked":
    case "applicantCompanyRevoked":
      return <ShieldOffIcon strokeWidth={2.25} />;
    case "planEnded":
      return <CreditCardIcon strokeWidth={2.25} />;
    case "planPaymentActionRequired":
      return <TriangleAlertIcon strokeWidth={2.25} />;
    case "applicationStatusChanged":
      if (item.data.status === "interview") return <CalendarIcon strokeWidth={2.25} />;
      if (item.data.status === "accepted") return <CheckIcon strokeWidth={2.25} />;
      if (item.data.status === "rejected") return <XIcon strokeWidth={2.25} />;
      return <InfoIcon strokeWidth={2.25} />;
  }
}

interface NotificationItemProps {
  item: AppNotification;
  onOpen: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

export function NotificationItem({ item, onOpen, onToggleLock, onDelete }: NotificationItemProps) {
  const [confirming, setConfirming] = useState(false);
  const tone = notificationTone(item);
  const text = notificationText(item);

  return (
    <li className={cn("border-b border-l-2 border-border", TONE_EDGE[tone])}>
      <div className="flex items-start gap-3 py-3 pr-2 pl-3.5">
        <span aria-hidden className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-4", TONE_ICON[tone])}>
          <NotificationIcon item={item} />
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 flex-col gap-1 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className={cn("text-[0.95rem] leading-snug break-words", item.read ? "font-normal" : "font-semibold")}>
            {item.read ? null : <span className="sr-only">Unread: </span>}
            {text}
          </span>
          <time dateTime={item.createdAt} className="text-[0.8rem] text-muted-foreground">
            {formatDateTime(item.createdAt)}
          </time>
        </button>
        {confirming ? null : (
          <div className="flex shrink-0 items-center">
            {showsExpiryWarning(item) ? (
              <ReasonTip reason={`${countdownText(item)}. Lock it to keep it.`} className="size-8 place-items-center justify-center">
                <TriangleAlertIcon aria-hidden className="size-4 text-[color-mix(in_oklab,var(--line-amber),black_30%)] dark:text-line-amber" />
              </ReasonTip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={item.locked}
                  aria-label={item.locked ? `Unlock. ${countdownText(item)}` : "Lock to keep it"}
                  onClick={onToggleLock}
                  className={item.locked ? "text-foreground" : "text-muted-foreground"}
                >
                  {item.locked ? <LockIcon aria-hidden /> : <LockOpenIcon aria-hidden />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.locked ? countdownText(item) : "Lock it to stop the 30-day deletion"}</TooltipContent>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Delete notification"
              className="text-muted-foreground"
              onClick={() => (item.locked ? setConfirming(true) : onDelete())}
            >
              <XIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2 px-3.5 pb-3">
          <span className="mr-auto text-sm">Delete this locked notification?</span>
          <Button type="button" size="xs" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <Button type="button" size="xs" variant="ghost" onClick={() => setConfirming(false)}>
            Keep
          </Button>
        </div>
      ) : null}
    </li>
  );
}
