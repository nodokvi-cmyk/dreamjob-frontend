"use client";

import { CircleStopIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { editVacancyHref, ownVacancyHref } from "@/lib/routes";
import { canClose, isFinal } from "@/lib/vacancy";
import { closeVacancy, deleteVacancy } from "@/services/vacancies.service";
import type { OwnVacancy } from "@/types";

interface VacancyActionsProps {
  vacancy: OwnVacancy;
  now: number;
  approved: boolean;
  showPreview?: boolean;
  onClosed: () => void;
  onDeleted: () => void;
}

export function VacancyActions({
  vacancy,
  now,
  approved,
  showPreview = true,
  onClosed,
  onDeleted,
}: VacancyActionsProps) {
  const editable = !isFinal(vacancy.status);
  const title = vacancy.title;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showPreview ? (
        <Button asChild variant="outline" size="sm">
          <Link href={ownVacancyHref(vacancy.id)} aria-label={`Preview ${title}`}>
            <EyeIcon aria-hidden />
            Preview
          </Link>
        </Button>
      ) : null}
      {editable ? (
        approved ? (
          <Button asChild variant="outline" size="sm">
            <Link href={editVacancyHref(vacancy.id)} aria-label={`Edit ${title}`}>
              <PencilIcon aria-hidden />
              Edit
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label={`Edit ${title}, paused until your company is approved`}
            title="Editing is paused until your company is approved"
          >
            <PencilIcon aria-hidden />
            Edit
          </Button>
        )
      ) : null}
      {canClose(vacancy, now) ? (
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" aria-label={`Close ${title}`}>
              <CircleStopIcon aria-hidden />
              Close
            </Button>
          }
          title="Close this vacancy?"
          description={
            <p>
              <span className="font-semibold text-foreground">{title}</span> leaves the vacancy list
              right away, and its page shows it as closed. A closed vacancy can&apos;t be reopened or
              edited.
            </p>
          }
          confirmLabel="Close vacancy"
          pendingLabel="Closing"
          cancelLabel="Keep it live"
          icon={<CircleStopIcon aria-hidden />}
          onConfirm={async () => {
            await closeVacancy(vacancy.id);
            onClosed();
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
        title="Delete this vacancy?"
        description={
          <p>
            <span className="font-semibold text-foreground">{title}</span>
            {vacancy.photos.length > 0
              ? ` and its ${vacancy.photos.length === 1 ? "photo are" : `${vacancy.photos.length} photos are`} deleted for good.`
              : " is deleted for good."}{" "}
            It can&apos;t be undone.
          </p>
        }
        confirmLabel="Delete for good"
        pendingLabel="Deleting"
        cancelLabel="Keep it"
        tone="danger"
        icon={<Trash2Icon aria-hidden />}
        onConfirm={async () => {
          await deleteVacancy(vacancy.id);
          onDeleted();
        }}
      />
    </div>
  );
}
