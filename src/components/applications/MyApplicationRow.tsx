"use client";

import { RotateCcwIcon, UndoIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApplicationFiles } from "@/components/applications/ApplicationFiles";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { APPLY_TONE } from "@/components/vacancies/ApplyButton";
import { VacancyEmployer } from "@/components/vacancies/VacancyEmployer";
import { companyHref, vacancyHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/vacancy";
import { withdrawApplication } from "@/services/applications.service";
import type { MyApplication } from "@/types";

const WITHDRAWABLE = new Set(["submitted", "viewed", "interview", "accepted"]);

const VACANCY_NOTE: Record<MyApplication["vacancy"]["status"], string | null> = {
  published: null,
  expired: "Vacancy expired",
  closed: "Vacancy closed",
  unavailable: "Temporarily unavailable",
};

function withdrawWarning(application: MyApplication): string {
  if (application.status === "accepted") {
    return "This application was accepted. If you withdraw it, you can't apply to this vacancy again.";
  }
  if (application.submissions >= 2) return "This is your second application, so you can't apply to this vacancy again.";
  return "You can reapply only once, and only while the vacancy is open.";
}

export function myApplicationRowId(id: string): string {
  return `my-application-${id}`;
}

interface MyApplicationRowProps {
  application: MyApplication;
  onWithdrawn: (application: MyApplication) => void;
  focused?: boolean;
}

export function MyApplicationRow({ application, onWithdrawn, focused = false }: MyApplicationRowProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { vacancy } = application;
  const linked = vacancy.status !== "unavailable";
  const note = VACANCY_NOTE[vacancy.status];
  const reapplied = application.submissions >= 2;
  const headingId = `application-${application.id}`;

  return (
    <article
      id={myApplicationRowId(application.id)}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={cn(
        "flex scroll-mt-28 flex-col gap-4 rounded-xl border bg-card px-4 py-5 outline-none sm:px-5",
        focused ? "border-line-cobalt ring-3 ring-line-cobalt/30" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ApplicationStatusBadge status={application.status} />
        {note ? <span className="transit-label text-[0.8rem] text-muted-foreground">{note}</span> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h2 id={headingId} className="font-display text-[1.5rem] leading-[1.1] font-semibold break-words">
          {linked ? (
            <Link
              href={vacancyHref(vacancy.id)}
              className="underline-offset-4 hover:underline hover:decoration-line-scarlet hover:decoration-2"
            >
              {vacancy.title}
            </Link>
          ) : (
            <span className="text-muted-foreground">{vacancy.title}</span>
          )}
        </h2>
        <VacancyEmployer
          employer={{
            companyName: vacancy.companyName,
            logoUrl: vacancy.logoUrl,
            approved: application.companyApproved,
            href: companyHref(vacancy.company),
          }}
          size="sm"
        />
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-1.5 text-[0.95rem]">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{reapplied ? "Reapplied" : "Applied"}</dt>
          <dd>
            <time dateTime={application.appliedAt}>{formatDateTime(application.appliedAt)}</time>
          </dd>
        </div>
        {reapplied ? (
          <div className="flex gap-1.5 text-muted-foreground">
            <dt>First applied</dt>
            <dd>
              <time dateTime={application.firstAppliedAt}>{formatDateTime(application.firstAppliedAt)}</time>
            </dd>
          </div>
        ) : null}
        {application.previousOutcome ? (
          <div className="flex gap-1.5 text-muted-foreground">
            <dt className="sr-only">Earlier application</dt>
            <dd>{application.previousOutcome === "withdrawn" ? "After you withdrew" : "After a rejection"}</dd>
          </div>
        ) : null}
      </dl>
      {application.message ? (
        <p className="line-clamp-3 max-w-[65ch] text-[0.95rem] leading-relaxed whitespace-pre-line text-muted-foreground">
          {application.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <ApplicationFiles
          applicationId={application.id}
          hasCv={application.hasCv}
          hasCoverLetter={application.hasCoverLetter}
          onError={setFileError}
        />
        {application.canReapply ? (
          <Button asChild size="sm" className={APPLY_TONE.reapply}>
            <Link href={`${vacancyHref(vacancy.id)}#apply`}>
              <RotateCcwIcon aria-hidden />
              Reapply
            </Link>
          </Button>
        ) : null}
        {WITHDRAWABLE.has(application.status) ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="sm:ml-auto"
            onClick={() => setConfirming(true)}
          >
            <UndoIcon aria-hidden />
            Withdraw
          </Button>
        ) : null}
      </div>
      {fileError ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {fileError}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title="Withdraw this application?"
        description={
          <div className="flex flex-col gap-2">
            <p className="text-foreground">Withdraw and delete your CV and cover letter from this application?</p>
            <p>Your message is deleted too. {withdrawWarning(application)}</p>
          </div>
        }
        confirmLabel="Withdraw"
        pendingLabel="Withdrawing..."
        cancelLabel="Keep it"
        onConfirm={async () => {
          await withdrawApplication(application.id);
          onWithdrawn(application);
        }}
      />
    </article>
  );
}
