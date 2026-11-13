import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { CompanyWarning } from "@/components/vacancies/VacancyEmployer";
import { adminVacanciesHref, shortCompanyId } from "@/lib/adminQuery";
import { companyHref } from "@/lib/routes";

interface CompanyCardProps {
  companyId: string;
  companyName: string;
  logoUrl: string;
  approved: boolean;
}

export function CompanyCard({ companyId, companyName, logoUrl, approved }: CompanyCardProps) {
  const name = companyName.trim() || shortCompanyId(companyId);

  return (
    <section
      aria-labelledby="company-card-title"
      className="flex flex-col gap-4 rounded-[17px] border border-border bg-card p-5"
    >
      <h2 id="company-card-title" className="transit-label text-[0.85rem] text-muted-foreground">
        Posted by
      </h2>
      <div className="flex min-w-0 items-center gap-4">
        <AccountPhoto src={logoUrl} kind="company" alt={`${name} logo`} size="md" fit="contain" />
        <p className="min-w-0 font-display text-[1.5rem] leading-[1.05] font-bold break-words">{name}</p>
      </div>
      {approved ? null : <CompanyWarning />}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Link
          href={adminVacanciesHref({ status: "all", companyId })}
          className="inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
        >
          View vacancies
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
        {approved ? (
          <Link
            href={companyHref(companyId)}
            className="inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
          >
            Public page
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
