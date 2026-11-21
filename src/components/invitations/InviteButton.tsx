"use client";

import { MailIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useLoad } from "@/components/dashboard/useLoad";
import { FieldFrame } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { countWords } from "@/lib/applications";
import { formError } from "@/lib/errors";
import {
  INVITE_MESSAGE_MAX_CHARS,
  INVITE_MESSAGE_MAX_WORDS,
  quotaLeft,
  quotaText,
} from "@/lib/invitations";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/vacancy";
import { invitePublication } from "@/services/invitations.service";
import { listMyVacancies } from "@/services/vacancies.service";
import type { InvitationQuota, InvitationState } from "@/types";

const VACANCY_TAKE = 30;

interface InviteButtonProps {
  publication: { id: string; title: string; invitation: InvitationState };
  quota: InvitationQuota | null;
  onInvited: () => void;
  excludeVacancyId?: string | null;
  size?: "sm" | "default";
}

export function InviteButton({ publication, quota, onInvited, excludeVacancyId = null, size = "sm" }: InviteButtonProps) {
  const [vacancyId, setVacancyId] = useState("");
  const [message, setMessage] = useState("");
  const out = quota !== null && quotaLeft(quota) === 0;
  const again = publication.invitation !== "none";
  const label = again ? "Invite again" : "Invite";
  const ariaLabel = `${label}: ${publication.title}`;

  if (out) {
    return (
      <Button type="button" size={size} disabled aria-label={ariaLabel} title="Monthly invitation limit reached">
        <MailIcon aria-hidden />
        {label}
      </Button>
    );
  }

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" size={size} aria-label={ariaLabel}>
          <MailIcon aria-hidden />
          {label}
        </Button>
      }
      onOpenChange={(open) => {
        if (open) return;
        setVacancyId("");
        setMessage("");
      }}
      title={again ? "Invite again" : "Invite to apply"}
      description={
        <InviteFields
          title={publication.title}
          state={publication.invitation}
          excludeVacancyId={excludeVacancyId}
          quota={quota}
          vacancyId={vacancyId}
          message={message}
          onVacancy={setVacancyId}
          onMessage={setMessage}
        />
      }
      confirmLabel="Send invitation"
      pendingLabel="Sending"
      icon={<MailIcon aria-hidden />}
      onConfirm={async () => {
        if (!vacancyId) throw new Error("Choose one of your live vacancies.");
        const text = message.trim();
        if (countWords(text) > INVITE_MESSAGE_MAX_WORDS) {
          throw new Error(`Keep the message to ${INVITE_MESSAGE_MAX_WORDS} words.`);
        }
        await invitePublication(publication.id, vacancyId, text);
        onInvited();
      }}
    />
  );
}

interface InviteFieldsProps {
  title: string;
  state: InvitationState;
  excludeVacancyId: string | null;
  quota: InvitationQuota | null;
  vacancyId: string;
  message: string;
  onVacancy: (id: string) => void;
  onMessage: (text: string) => void;
}

function againNote(state: InvitationState): string | null {
  if (state === "declined") {
    return "They declined your earlier invitation, so this one must be for a different vacancy. It is the last invitation you can send to this publication.";
  }
  if (state === "none") return null;
  return "This is the last invitation you can send to this publication.";
}

function InviteFields({
  title,
  state: invitation,
  excludeVacancyId,
  quota,
  vacancyId,
  message,
  onVacancy,
  onMessage,
}: InviteFieldsProps) {
  const id = useId();
  const { state } = useLoad(`invite-vacancies-${excludeVacancyId ?? "all"}`, async (signal) => {
    const page = await listMyVacancies({ status: "published" }, VACANCY_TAKE, signal);
    return page.items.filter((vacancy) => vacancy.status === "published" && vacancy.id !== excludeVacancyId);
  });
  const note = againNote(invitation);
  const words = countWords(message);
  const chosen = state.status === "ready" ? state.data.find((vacancy) => vacancy.id === vacancyId) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <p>
        Invite <span className="font-semibold text-foreground">{title}</span> to apply to one of your live vacancies.
        If they accept, their application arrives with the CV and cover letter of this publication, and you see their
        email and phone.
      </p>
      {note ? <p>{note}</p> : null}
      {quota ? <p className="transit-label text-[0.85rem] text-foreground">{quotaText(quota)}</p> : null}
      {state.status === "loading" ? (
        <Skeleton className="h-11 w-full" />
      ) : state.status === "failed" ? (
        <p className="text-sm font-medium text-destructive">{formError(state.error).message}</p>
      ) : state.data.length === 0 ? (
        <p className="text-sm">
          You have no live vacancy to invite to.{" "}
          <Link href={routes.dashboard} className="font-medium text-cobalt-ink underline-offset-4 hover:underline">
            Go to your dashboard
          </Link>
        </p>
      ) : (
        <FieldFrame id={`${id}-vacancy`} label="Vacancy">
          <Select value={vacancyId} onValueChange={onVacancy}>
            <SelectTrigger id={`${id}-vacancy`} className="w-full">
              <SelectValue placeholder="Choose a vacancy">{chosen?.title ?? "Choose a vacancy"}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              {state.data.map((vacancy) => (
                <SelectItem key={vacancy.id} value={vacancy.id}>
                  {vacancy.title} · closes {formatDate(vacancy.deadline)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldFrame>
      )}
      <FieldFrame
        id={`${id}-message`}
        label="Message"
        optional
        aside={
          <span className={cn("text-xs tabular", words > INVITE_MESSAGE_MAX_WORDS ? "font-medium text-destructive" : "text-muted-foreground")}>
            {words} / {INVITE_MESSAGE_MAX_WORDS} words
          </span>
        }
      >
        <Textarea
          id={`${id}-message`}
          rows={4}
          value={message}
          maxLength={INVITE_MESSAGE_MAX_CHARS}
          onChange={(event) => onMessage(event.target.value)}
        />
      </FieldFrame>
    </div>
  );
}
