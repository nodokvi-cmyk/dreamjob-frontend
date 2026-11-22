import { MapPinIcon } from "lucide-react";
import Link from "next/link";
import { Stars } from "@/components/companies/Stars";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { companyHref } from "@/lib/routes";
import { vacanciesHref } from "@/lib/vacancyQuery";
import type { PublicCompanyCard } from "@/types";

export function openVacanciesText(count: number): string {
  if (count === 0) return "No open vacancies";
  return `${count} open ${count === 1 ? "vacancy" : "vacancies"}`;
}

export function CompanyListCard({ company }: { company: PublicCompanyCard }) {
  const name = company.companyName.trim() || "Company";
  const places = company.location ? [company.location] : company.operatingCities.slice(0, 2);

  return (
    <article className="relative flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/40 sm:gap-5">
      <AccountPhoto src={company.logoUrl} kind="company" alt={`${name} logo`} size="md" fit="contain" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="font-display text-2xl leading-none font-bold tracking-[-0.01em] break-words uppercase">
          <Link href={companyHref(company.id)} className="after:absolute after:inset-0 after:rounded-2xl">
            {name}
          </Link>
        </h2>
        <Stars rating={company.rating} size="sm" />
        {places.length > 0 ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{places.join(", ")}</span>
          </p>
        ) : null}
        {company.excerpt ? (
          <p className="line-clamp-2 max-w-[70ch] text-[0.98rem] leading-relaxed text-muted-foreground">{company.excerpt}</p>
        ) : null}
        {company.openVacancies > 0 ? (
          <Link
            href={vacanciesHref({ companyId: company.id })}
            className="relative z-10 w-fit text-sm font-semibold text-cobalt-ink underline-offset-4 hover:underline"
          >
            {openVacanciesText(company.openVacancies)}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">{openVacanciesText(0)}</p>
        )}
      </div>
    </article>
  );
}
