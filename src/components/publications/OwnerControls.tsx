"use client";

import { CalendarPlusIcon, CircleStopIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { formError } from "@/lib/errors";
import {
  canClosePublication,
  canEditPublication,
  canExtendPublication,
} from "@/lib/publications";
import { editPublicationHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  closePublication,
  deletePublication,
  extendPublication,
  setAcceptingInvites,
} from "@/services/publications.service";
import type { Publication } from "@/types";

interface InvitesSwitchProps {
  publication: Pick<Publication, "id" | "acceptingInvites">;
  onChanged: (publication: Publication) => void;
  onError: (message: string | null) => void;
}

export function InvitesSwitch({ publication, onChanged, onError }: InvitesSwitchProps) {
  const labelId = useId();
  const [pending, setPending] = useState(false);
  const on = publication.acceptingInvites;

  async function toggle() {
    setPending(true);
    onError(null);
    try {
      onChanged(await setAcceptingInvites(publication.id, !on));
    } catch (error: unknown) {
      onError(formError(error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        onClick={toggle}
        disabled={pending}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-60",
          on ? "border-line-green bg-line-green" : "border-foreground/25 bg-muted",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-4 rounded-full border-[3px] bg-card shadow-[0_1px_2px_rgb(11_18_48/0.25)] transition-transform duration-200 ease-[var(--ease-out-expo)]",
            on ? "translate-x-[17px] border-white" : "translate-x-[2px] border-foreground/40",
          )}
        />
      </button>
      <span id={labelId} className="transit-label text-[0.85rem]">
        <span className={on ? "text-success-ink" : "text-muted-foreground"}>
          {on ? "Open to invites" : "Hidden from companies"}
        </span>
      </span>
    </div>
  );
}

interface PublicationActionsProps {
  publication: Publication;
  now: number;
  onChanged: (publication: Publication, message: string) => void;
  onDeleted: () => void;
  onError: (message: string | null) => void;
}

export function PublicationActions({ publication, now, onChanged, onDeleted, onError }: PublicationActionsProps) {
  const [extending, setExtending] = useState(false);
  const { id, title } = publication;

  async function extend() {
    setExtending(true);
    onError(null);
    try {
      onChanged(await extendPublication(id), "Extended. It stays visible for 60 days from today.");
    } catch (error: unknown) {
      onError(formError(error).message);
    } finally {
      setExtending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEditPublication(publication) ? (
        <Button asChild variant="outline" size="sm">
          <Link href={editPublicationHref(id)} aria-label={`Edit ${title}`}>
            <PencilIcon aria-hidden />
            Edit
          </Link>
        </Button>
      ) : null}
      {canExtendPublication(publication, now) ? (
        <Button type="button" size="sm" onClick={extend} disabled={extending}>
          <CalendarPlusIcon aria-hidden />
          {extending ? "Extending" : "Extend 60 days"}
        </Button>
      ) : null}
      {canClosePublication(publication) ? (
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" aria-label={`Close ${title}`}>
              <CircleStopIcon aria-hidden />
              Close
            </Button>
          }
          title="Close this publication?"
          description={
            <p>
              <span className="font-semibold text-foreground">{title}</span> ends for good and companies stop
              seeing it. It stays in your list as closed and frees one of your 3 active slots. A closed
              publication can&apos;t be edited or reopened.
            </p>
          }
          confirmLabel="Close publication"
          pendingLabel="Closing"
          onConfirm={async () => {
            onChanged(await closePublication(id), "Publication closed.");
          }}
        />
      ) : null}
      <ConfirmDialog
        trigger={
          <Button variant="destructive" size="sm" aria-label={`Delete ${title}`}>
            <Trash2Icon aria-hidden />
            Delete
          </Button>
        }
        tone="danger"
        title="Delete this publication and its CV and cover letter?"
        description={
          <p>
            <span className="font-semibold text-foreground">{title}</span> is removed at once with its files.
            This can&apos;t be undone.
          </p>
        }
        confirmLabel="Delete publication"
        pendingLabel="Deleting"
        onConfirm={async () => {
          await deletePublication(id);
          onDeleted();
        }}
      />
    </div>
  );
}
