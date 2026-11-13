"use client";

import { MailIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApplicationFiles } from "@/components/applications/ApplicationFiles";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APPLICATION_STATUS_LABELS, COMPANY_APPLICATION_STATUSES } from "@/lib/applications";
import { formError } from "@/lib/errors";
import { userHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/vacancy";
import { ApiError } from "@/services/api";
import { changeApplicationStatus } from "@/services/applications.service";
import type { ApplicantItem, ApplicationStatus, CompanyApplicationStatus, VisibleApplicantItem } from "@/types";

interface ApplicantRowProps {
  item: ApplicantItem;
  focused: boolean;
  onStatusChanged: (id: string, status: ApplicationStatus) => void;
  onStale: (message: string) => void;
}

export function applicantRowId(id: string): string {
  return `applicant-row-${id}`;
}

export function ApplicantRow({ item, focused, onStatusChanged, onStale }: ApplicantRowProps) {
  const frame = cn(
    "flex scroll-mt-28 flex-col gap-4 rounded-xl border bg-card px-4 py-5 transition-shadow duration-500 sm:px-5",
    focused ? "border-line-cobalt ring-3 ring-line-cobalt/30" : "border-border",
  );

  if (item.hidden) {
    return (
      <article id={applicantRowId(item.id)} tabIndex={-1} aria-label={item.status === "withdrawn" ? "Withdrawn application" : "Deleted user"} className={frame}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {item.status === "withdrawn" ? (
            <ApplicationStatusBadge status="withdrawn" />
          ) : (
            <span className="inline-flex h-7 items-center rounded-full border border-border bg-muted px-3 transit-label text-[0.8rem] text-muted-foreground">
              Deleted user
            </span>
          )}
          <span className="text-[0.95rem] text-muted-foreground">
            <time dateTime={item.appliedAt}>{formatDateTime(item.appliedAt)}</time>
          </span>
        </div>
      </article>
    );
  }

  return <VisibleRow item={item} frame={frame} onStatusChanged={onStatusChanged} onStale={onStale} />;
}

interface VisibleRowProps {
  item: VisibleApplicantItem;
  frame: string;
  onStatusChanged: (id: string, status: ApplicationStatus) => void;
  onStale: (message: string) => void;
}

function VisibleRow({ item, frame, onStatusChanged, onStale }: VisibleRowProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { applicant } = item;
  const name = [applicant.firstName, applicant.lastName].filter(Boolean).join(" ");
  const headingId = `applicant-${item.id}`;
  const selectable: readonly CompanyApplicationStatus[] = COMPANY_APPLICATION_STATUSES;

  async function change(next: CompanyApplicationStatus) {
    if (next === item.status) return;
    setPending(true);
    setError(null);
    try {
      const result = await changeApplicationStatus(item.id, next);
      onStatusChanged(result.id, result.status);
    } catch (caught: unknown) {
      if (caught instanceof ApiError && (caught.status === 409 || caught.status === 400)) {
        onStale(caught.message);
      } else {
        setError(formError(caught).message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <article id={applicantRowId(item.id)} tabIndex={-1} aria-labelledby={headingId} className={frame}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <AccountPhoto src={applicant.avatarUrl} kind="user" alt="" size="row" fit="cover" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 id={headingId} className="font-display text-[1.4rem] leading-[1.1] font-semibold break-words">
              <Link
                href={userHref(applicant.id)}
                className="underline-offset-4 hover:underline hover:decoration-line-scarlet hover:decoration-2"
              >
                {name}
              </Link>
            </h2>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
              {applicant.age !== null ? <span>{applicant.age} years</span> : null}
              {applicant.email ? (
                <a href={`mailto:${applicant.email}`} className="inline-flex min-w-0 items-center gap-1.5 break-all hover:text-foreground hover:underline">
                  <MailIcon aria-hidden className="size-4 shrink-0" />
                  {applicant.email}
                </a>
              ) : null}
              {applicant.phone ? (
                <a href={`tel:${applicant.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline">
                  <PhoneIcon aria-hidden className="size-4 shrink-0" />
                  {applicant.phone}
                </a>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:items-end">
          <ApplicationStatusBadge status={item.status} />
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1.5 text-[0.95rem]">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{item.isReapply ? "Reapplied" : "Applied"}</dt>
          <dd>
            <time dateTime={item.appliedAt}>{formatDateTime(item.appliedAt)}</time>
          </dd>
        </div>
        {item.isReapply ? (
          <div className="flex gap-1.5 text-muted-foreground">
            <dt>First applied</dt>
            <dd>
              <time dateTime={item.firstAppliedAt}>{formatDateTime(item.firstAppliedAt)}</time>
            </dd>
          </div>
        ) : null}
        {item.previousOutcome ? (
          <div className="flex gap-1.5 text-muted-foreground">
            <dt className="sr-only">Earlier application</dt>
            <dd>{item.previousOutcome === "withdrawn" ? "After withdrawing" : "After a rejection"}</dd>
          </div>
        ) : null}
      </dl>

      {item.message ? (
        <p className="max-w-[70ch] text-[1rem] leading-relaxed break-words whitespace-pre-line">{item.message}</p>
      ) : (
        <p className="text-[0.95rem] text-muted-foreground">No message.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <ApplicationFiles
          applicationId={item.id}
          hasCv={item.hasCv}
          hasCoverLetter={item.hasCoverLetter}
          onError={setError}
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <label htmlFor={`${headingId}-status`} className="text-sm text-muted-foreground">
            Status
          </label>
          <Select
            value={selectable.find((status) => status === item.status) ?? ""}
            onValueChange={(value) => {
              const next = selectable.find((status) => status === value);
              if (next) void change(next);
            }}
            disabled={pending}
          >
            <SelectTrigger id={`${headingId}-status`} className="h-9 w-40">
              <SelectValue placeholder="Set status">
                {pending ? "Saving" : selectable.some((status) => status === item.status) ? APPLICATION_STATUS_LABELS[item.status] : "Set status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              {selectable.map((status) => (
                <SelectItem key={status} value={status}>
                  {APPLICATION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </article>
  );
}
