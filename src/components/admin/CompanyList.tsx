"use client";

import { CheckIcon, InfoIcon, ShieldOffIcon } from "lucide-react";
import Link from "next/link";
import { CompanyFlags } from "@/components/admin/CompanyFlags";
import { staleMessage } from "@/components/admin/staleError";
import { shortCompanyId } from "@/components/admin/useCompanyNames";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Button } from "@/components/ui/button";
import { adminVacanciesHref } from "@/lib/adminQuery";
import { formatDate } from "@/lib/vacancy";
import { approveCompany, revokeCompany } from "@/services/admin.service";
import type { Company } from "@/types";

interface CompanyListProps {
  companies: Company[];
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}

export function CompanyList({ companies, onDone, onStale }: CompanyListProps) {
  return (
    <ul className="flex flex-col">
      {companies.map((company) => (
        <li key={company._id} className="border-b border-border">
          <CompanyRow company={company} onDone={onDone} onStale={onStale} />
        </li>
      ))}
    </ul>
  );
}

function CompanyRow({
  company,
  onDone,
  onStale,
}: {
  company: Company;
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}) {
  const name = company.companyName.trim() || shortCompanyId(company._id);
  const reasonId = `approve-blocked-${company._id}`;

  return (
    <article
      aria-labelledby={`company-${company._id}`}
      className="flex flex-col gap-4 px-1 py-5 sm:px-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-8"
    >
      <div className="flex min-w-0 gap-4">
        <AccountPhoto src={company.logoUrl} name={name} alt={`${name} logo`} size="md" fit="contain" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2
              id={`company-${company._id}`}
              className="font-display text-[1.45rem] leading-[1.1] font-semibold break-words"
            >
              {name}
            </h2>
            <p className="text-[0.95rem] break-all text-muted-foreground">{company.email}</p>
            <p className="text-[0.95rem] text-muted-foreground">
              {company.location ? `${company.location} · ` : null}Joined{" "}
              <time dateTime={company.createdAt}>{formatDate(company.createdAt)}</time>
            </p>
          </div>
          <CompanyFlags company={company} />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={adminVacanciesHref({ status: "all", companyId: company._id })}
              aria-label={`View vacancies from ${name}`}
            >
              View vacancies
            </Link>
          </Button>
          {company.approved ? (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" aria-label={`Revoke approval for ${name}`}>
                  <ShieldOffIcon aria-hidden />
                  Revoke
                </Button>
              }
              title="Revoke approval?"
              description={
                <p>
                  Its published vacancies stay public. <span className="font-semibold text-foreground">{name}</span>{" "}
                  can&apos;t create or edit vacancies until you approve it again.
                </p>
              }
              confirmLabel="Revoke approval"
              pendingLabel="Revoking"
              cancelLabel="Keep approved"
              tone="danger"
              icon={<ShieldOffIcon aria-hidden />}
              onConfirm={async () => {
                try {
                  await revokeCompany(company._id);
                } catch (failure: unknown) {
                  const message = staleMessage(failure);
                  if (message === null) throw failure;
                  onStale(message);
                  return;
                }
                onDone(`${name} is no longer approved.`);
              }}
            />
          ) : company.isProfileComplete ? (
            <ConfirmDialog
              trigger={
                <Button size="sm" aria-label={`Approve ${name}`}>
                  <CheckIcon aria-hidden />
                  Approve
                </Button>
              }
              title="Approve this company?"
              description={
                <p>
                  <span className="font-semibold text-foreground">{name}</span> can create and edit vacancies.
                  Each new vacancy still waits for your review.
                </p>
              }
              confirmLabel="Approve company"
              pendingLabel="Approving"
              cancelLabel="Not yet"
              icon={<CheckIcon aria-hidden />}
              onConfirm={async () => {
                try {
                  await approveCompany(company._id);
                } catch (failure: unknown) {
                  const message = staleMessage(failure);
                  if (message === null) throw failure;
                  onStale(message);
                  return;
                }
                onDone(`${name} is approved.`);
              }}
            />
          ) : (
            <Button size="sm" disabled aria-describedby={reasonId} aria-label={`Approve ${name}`}>
              <CheckIcon aria-hidden />
              Approve
            </Button>
          )}
        </div>
        {!company.approved && !company.isProfileComplete ? (
          <p id={reasonId} className="flex max-w-xs items-start gap-2 text-sm text-muted-foreground md:text-right">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0 md:order-2" />
            Approval is off until the company completes its profile.
          </p>
        ) : null}
      </div>
    </article>
  );
}
