"use client";

import { LockIcon } from "lucide-react";
import Link from "next/link";
import { CompanyStanding } from "@/components/dashboard/CompanyStanding";
import { EditorFrame, EditorSkeleton, OwnerLoadError, useOwnVacancy } from "@/components/dashboard/OwnerStates";
import { VacancyForm } from "@/components/dashboard/VacancyForm";
import { GateSpinner } from "@/components/guards/GateStates";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ownVacancyHref, routes } from "@/lib/routes";
import { canEdit, rejectedEditNote } from "@/lib/vacancyLifecycle";
import type { CurrentCompany, OwnVacancy } from "@/types";

export function EditVacancyScreen({ id }: { id: string }) {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <EditVacancy id={id} accountId={session.accountId} account={session.account} />;
}

function leadFor(vacancy: OwnVacancy): string {
  switch (vacancy.status) {
    case "notSubmitted":
      return "It isn't submitted yet. Save your changes, then submit it for review.";
    case "pending":
      return "It's waiting for review. Changes keep it in review.";
    case "published":
      return "It's live. Changing anything except the closing date, or adding a photo, sends it back to review.";
    case "rejected":
      return `Fix what our team pointed out. ${rejectedEditNote(vacancy)}`;
    case "expired":
      return "Its closing date passed before it was ever published. Set a new date to keep it in review.";
    case "closed":
      return "";
  }
}

function EditVacancy({ id, accountId, account }: { id: string; accountId: string; account: CurrentCompany }) {
  const { state, reload } = useOwnVacancy(id, accountId);

  if (state.status === "loading") return <EditorSkeleton />;
  if (state.status === "failed") return <OwnerLoadError error={state.error} onRetry={reload} />;

  const { vacancy, now } = state.data;
  const back = { href: ownVacancyHref(vacancy.id), label: "Back to preview" };

  if (!canEdit(vacancy)) {
    return (
      <EditorFrame
        title={vacancy.title}
        lead={
          vacancy.status === "closed"
            ? "You closed this vacancy, so it can't be edited any more."
            : "Its closing date has passed. Extend it from the preview to edit it again."
        }
        back={back}
        status={vacancy.status}
        vacancy={vacancy}
      >
        <div className="flex max-w-2xl flex-col gap-5 pt-8">
          <div className="flex gap-3.5 rounded-[17px] border border-border bg-card p-5 sm:p-6">
            <LockIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-xl leading-tight font-bold tracking-[-0.01em] uppercase">Read only</h2>
              <p className="text-muted-foreground">
                {vacancy.status === "closed"
                  ? "Closed vacancies stay exactly as they were published. To hire for this role again, post a new vacancy."
                  : "An expired vacancy that was published must be extended before it can change. Use Extend on the preview page; it puts the vacancy back live."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={ownVacancyHref(vacancy.id)}>Preview vacancy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.dashboard}>Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </EditorFrame>
    );
  }

  return (
    <EditorFrame
      title="Edit vacancy"
      lead={leadFor(vacancy)}
      back={back}
      status={vacancy.status}
      vacancy={vacancy}
    >
      <div className="flex flex-col gap-8 pt-8">
        <CompanyStanding account={account} />
        <VacancyForm key={vacancy.updatedAt} account={account} now={now} vacancy={vacancy} />
      </div>
    </EditorFrame>
  );
}
