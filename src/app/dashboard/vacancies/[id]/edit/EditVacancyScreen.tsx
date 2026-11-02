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
import { isFinal } from "@/lib/vacancy";
import type { CurrentCompany, OwnVacancy } from "@/types";

export function EditVacancyScreen({ id }: { id: string }) {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <EditVacancy id={id} accountId={session.accountId} account={session.account} />;
}

const LEADS: Record<OwnVacancy["status"], string> = {
  pending: "It's waiting for review. Changes keep it in review.",
  published: "It's live. Changing anything except the closing date sends it back to review.",
  rejected: "Fix what our team pointed out, then save to send it back for review.",
  closed: "",
  expired: "",
};

function EditVacancy({ id, accountId, account }: { id: string; accountId: string; account: CurrentCompany }) {
  const { state, reload } = useOwnVacancy(id, accountId);

  if (state.status === "loading") return <EditorSkeleton />;
  if (state.status === "failed") return <OwnerLoadError error={state.error} onRetry={reload} />;

  const { vacancy, now } = state.data;
  const back = { href: ownVacancyHref(vacancy.id), label: "Back to preview" };

  if (isFinal(vacancy.status)) {
    return (
      <EditorFrame
        title={vacancy.title}
        lead={
          vacancy.status === "closed"
            ? "You closed this vacancy, so it can't be edited any more."
            : "Its closing date has passed, so it can't be edited any more."
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
                Closed and expired vacancies stay exactly as they were published. To hire for this role
                again, post a new vacancy.
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
      lead={LEADS[vacancy.status]}
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
