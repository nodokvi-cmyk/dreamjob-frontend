"use client";

import { EyeIcon, PencilIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useLoad } from "@/components/dashboard/useLoad";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { applicantsPath, editVacancyHref, ownVacancyHref } from "@/lib/routes";
import { canEdit, wasPublished } from "@/lib/vacancyLifecycle";
import { getOwnVacancy } from "@/services/vacancies.service";
import type { OwnVacancy } from "@/types";

export function OwnerBar({ vacancy, approved }: { vacancy: OwnVacancy; approved: boolean }) {
  const applicantCount = vacancy.applicantCount ?? 0;
  const newApplicants = vacancy.newApplicants ?? 0;

  return (
    <div className="border-b border-border bg-muted">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="transit-label text-[0.85rem] text-foreground">This is your vacancy</p>
        <div className="flex flex-wrap items-center gap-2">
          {wasPublished(vacancy) ? (
            <div className="flex items-center gap-1.5">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={applicantsPath(vacancy.id)}
                  aria-label={`Applicants for ${vacancy.title}${applicantCount > 0 ? `, ${applicantCount}` : ""}`}
                >
                  <UsersIcon aria-hidden />
                  Applicants
                  {applicantCount > 0 ? <span className="tabular font-bold">{applicantCount}</span> : null}
                </Link>
              </Button>
              {newApplicants > 0 ? (
                <span className="transit-label inline-flex h-7 items-center rounded-full bg-line-scarlet px-2.5 text-[0.8rem] text-white">
                  {newApplicants} new
                </span>
              ) : null}
            </div>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={ownVacancyHref(vacancy.id)} aria-label={`Preview ${vacancy.title} in your dashboard`}>
              <EyeIcon aria-hidden />
              Preview
            </Link>
          </Button>
          {canEdit(vacancy) ? (
            approved ? (
              <Button asChild variant="outline" size="sm">
                <Link href={editVacancyHref(vacancy.id)} aria-label={`Edit ${vacancy.title}`}>
                  <PencilIcon aria-hidden />
                  Edit
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                aria-label={`Edit ${vacancy.title}, paused until your company is approved`}
                title="Editing is paused until your company is approved"
              >
                <PencilIcon aria-hidden />
                Edit
              </Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OwnerLinks({ id, accountId, approved }: { id: string; accountId: string; approved: boolean }) {
  const { state } = useLoad(`${accountId}:${id}`, (signal) => getOwnVacancy(id, accountId, signal));
  if (state.status !== "ready") return null;
  return <OwnerBar vacancy={state.data} approved={approved} />;
}

export function OwnerStrip({ vacancyId, companyId }: { vacancyId: string; companyId: string }) {
  const { status, session } = useAuth();
  if (status !== "authenticated" || !session) return null;
  if (session.accountRole !== "company" || session.accountId !== companyId) return null;
  return <OwnerLinks id={vacancyId} accountId={session.accountId} approved={session.account.approved} />;
}
