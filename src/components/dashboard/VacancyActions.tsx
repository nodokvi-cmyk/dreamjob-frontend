"use client";

import { CircleStopIcon, EyeIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { ExtendVacancy } from "@/components/dashboard/ExtendVacancy";
import { SubmitVacancy } from "@/components/dashboard/SubmitVacancy";
import { Button } from "@/components/ui/button";
import { applicantsPath, editVacancyHref, ownVacancyHref } from "@/lib/routes";
import { canClose, formatDay } from "@/lib/vacancy";
import { canEdit, canExtend, canSubmit, wasPublished } from "@/lib/vacancyLifecycle";
import { closeVacancy, deleteVacancy } from "@/services/vacancies.service";
import type { CurrentCompany, OwnVacancy } from "@/types";

interface VacancyActionsProps {
  vacancy: Pick<
    OwnVacancy,
    "id" | "title" | "status" | "deadline" | "photos" | "firstPublishedAt" | "freeWindowEndsAt"
  >;
  now: number;
  account: CurrentCompany;
  showPreview?: boolean;
  onClosed: () => void;
  onDeleted: () => void;
  onUpdated: (message: string) => void;
}

export function VacancyActions({
  vacancy,
  now,
  account,
  showPreview = true,
  onClosed,
  onDeleted,
  onUpdated,
}: VacancyActionsProps) {
  const editable = canEdit(vacancy);
  const approved = account.approved;
  const title = vacancy.title;
  const paymentProcessing = () => onUpdated(`Your payment for “${title}” went through. It may take a moment to show here.`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit(vacancy) ? (
        <SubmitVacancy
          vacancy={vacancy}
          account={account}
          onSubmitted={() => onUpdated(`“${title}” is sent for review.`)}
          onPaymentProcessing={paymentProcessing}
        />
      ) : null}
      {canExtend(vacancy) ? (
        <ExtendVacancy
          vacancy={vacancy}
          account={account}
          now={now}
          onExtended={(day) => onUpdated(`“${title}” now closes on ${formatDay(day)}.`)}
          onPaymentProcessing={paymentProcessing}
        />
      ) : null}
      {wasPublished(vacancy) ? (
        <Button asChild variant="outline" size="sm">
          <Link href={applicantsPath(vacancy.id)} aria-label={`Applicants for ${title}`}>
            <UsersIcon aria-hidden />
            Applicants
          </Link>
        </Button>
      ) : null}
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
            It can&apos;t be undone. {deleteRefund(vacancy)}
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

function deleteRefund(vacancy: Pick<OwnVacancy, "status" | "firstPublishedAt">): string {
  if (vacancy.status === "notSubmitted") return "Deleting a draft costs nothing.";
  if (vacancy.status === "pending" && !vacancy.firstPublishedAt) return "The credit it used comes back to you.";
  return "No credit or payment comes back.";
}
