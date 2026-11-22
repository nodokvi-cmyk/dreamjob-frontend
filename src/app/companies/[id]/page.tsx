import { ArrowRightIcon, ExternalLinkIcon, MailIcon, MapPinIcon, PhoneIcon, UserRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { openVacanciesText } from "@/components/companies/CompanyListCard";
import { CompanyRating } from "@/components/companies/CompanyRating";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Button } from "@/components/ui/button";
import { ResultsError } from "@/components/vacancies/ListStates";
import { VacancyList } from "@/components/vacancies/VacancyList";
import { ViewerMarksProvider } from "@/components/vacancies/ViewerMarks";
import { routes } from "@/lib/routes";
import { canonicalFor, openGraphFor } from "@/lib/site";
import { summary } from "@/lib/vacancy";
import { vacanciesHref } from "@/lib/vacancyQuery";
import { getPublicCompany } from "@/services/publicCompanies.service";
import { listVacancies } from "@/services/publicVacancies.service";
import type { PublicCompany, VacancyCard, VacancyQuery } from "@/types";

type Loaded = { kind: "found"; company: PublicCompany } | { kind: "missing" } | { kind: "failed" };

async function load(id: string): Promise<Loaded> {
  try {
    const company = await getPublicCompany(id);
    return company ? { kind: "found", company } : { kind: "missing" };
  } catch {
    return { kind: "failed" };
  }
}

const PREVIEW_COUNT = 3;

function previewQuery(companyId: string): VacancyQuery {
  return { companyId, sort: "-date" };
}

async function loadPreview(companyId: string): Promise<{ items: VacancyCard[]; now: number } | null> {
  try {
    const page = await listVacancies(previewQuery(companyId), PREVIEW_COUNT);
    await connection();
    return { items: page.items, now: Date.now() };
  } catch {
    return null;
  }
}

function companyName(company: PublicCompany): string {
  return company.companyName.trim() || "Company";
}

export async function generateMetadata({ params }: PageProps<"/companies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") return { title: "Company not found", robots: { index: false } };
  if (loaded.kind === "failed") return { title: "Company" };
  const { company } = loaded;
  const description = company.description ? summary(company.description) : `${companyName(company)} on GetDreamJob.`;
  return {
    title: companyName(company),
    description,
    alternates: canonicalFor(`/companies/${company.id}`),
    openGraph: openGraphFor(`/companies/${company.id}`, {
      title: companyName(company),
      description,
      images: company.logoUrl ? [{ url: company.logoUrl, alt: `${companyName(company)} logo` }] : undefined,
    }),
  };
}

export default async function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") notFound();
  if (loaded.kind === "failed") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ResultsError
          title="This company didn't load"
          body="We couldn't reach GetDreamJob just now. Check your connection, then try again."
        />
      </div>
    );
  }
  const { company } = loaded;
  const name = companyName(company);
  const preview = company.openVacancies > 0 ? await loadPreview(company.id) : null;
  const website = company.website.trim();
  const pastHref = vacanciesHref({ companyId: company.id, period: "past" });

  return (
    <article className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 pb-9 sm:flex-row sm:items-center sm:gap-8 sm:px-6 md:pt-12 lg:px-8">
          <AccountPhoto src={company.logoUrl} kind="company" alt={`${name} logo`} size="lg" fit="contain" />
          <div className="flex min-w-0 flex-col gap-3">
            <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[0.98] font-bold tracking-[-0.02em] break-words uppercase">
              {name}
            </h1>
            {company.location ? (
              <p className="inline-flex items-center gap-2 text-[1.02rem] text-muted-foreground">
                <MapPinIcon aria-hidden className="size-[1.1rem] shrink-0" />
                {company.location}
              </p>
            ) : null}
            <p className="text-[1.02rem] font-medium">{openVacanciesText(company.openVacancies)}</p>
            <CompanyRating companyId={company.id} rating={company.rating} ratingCount={company.ratingCount} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-10">
        <aside
          aria-label="Contact"
          className="self-start rounded-2xl bg-enamel p-6 text-on-enamel sm:p-7 lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4 xl:col-start-9 dark:ring-1 dark:ring-enamel-seam"
        >
          <p className="transit-label text-[0.85rem] text-on-enamel-muted">Contact</p>
          <ul className="mt-4 flex flex-col gap-3.5 text-[1.02rem]">
            {website ? (
              <li className="flex items-center gap-3">
                <ExternalLinkIcon aria-hidden className="size-4 shrink-0 text-on-enamel-muted" />
                <a href={website} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all underline-offset-4 hover:underline">
                  {website.replace(/^https?:\/\//, "")}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ) : null}
            {company.email ? (
              <li className="flex items-center gap-3">
                <MailIcon aria-hidden className="size-4 shrink-0 text-on-enamel-muted" />
                <a href={`mailto:${company.email}`} className="min-w-0 break-all underline-offset-4 hover:underline">
                  {company.email}
                </a>
              </li>
            ) : null}
            {company.phone ? (
              <li className="flex items-center gap-3">
                <PhoneIcon aria-hidden className="size-4 shrink-0 text-on-enamel-muted" />
                <a href={`tel:${company.phone}`} className="underline-offset-4 hover:underline">
                  {company.phone}
                </a>
              </li>
            ) : null}
          </ul>
          {company.director ? (
            <div className="mt-6 flex flex-col gap-1 border-t border-enamel-seam pt-5">
              <p className="transit-label text-[0.78rem] text-on-enamel-muted">Director</p>
              <p className="inline-flex items-center gap-2 font-medium">
                <UserRoundIcon aria-hidden className="size-4 text-on-enamel-muted" />
                {company.director.fullName}
              </p>
              {company.director.phone ? (
                <a href={`tel:${company.director.phone}`} className="w-fit text-[0.95rem] text-on-enamel-muted underline-offset-4 hover:underline">
                  {company.director.phone}
                </a>
              ) : null}
            </div>
          ) : null}
          {company.operatingCities.length > 0 ? (
            <div className="mt-6 flex flex-col gap-2 border-t border-enamel-seam pt-5">
              <p className="transit-label text-[0.78rem] text-on-enamel-muted">Operates in</p>
              <ul className="flex flex-wrap gap-2">
                {company.operatingCities.map((city) => (
                  <li key={city} className="rounded-full border border-on-enamel/30 px-3 py-1 text-sm">
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col gap-8 lg:col-span-7 lg:row-start-1 xl:col-span-8 xl:pr-6">
          <section aria-labelledby="about-title" className="flex flex-col gap-4">
            <h2 id="about-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
              About the company
            </h2>
            {company.description ? (
              <p className="max-w-[70ch] text-[1.06rem] leading-[1.7] break-words whitespace-pre-line">{company.description}</p>
            ) : (
              <p className="text-muted-foreground">This company hasn&apos;t added a description yet.</p>
            )}
          </section>
          <section aria-labelledby="open-title" className="flex flex-col gap-5">
            <h2 id="open-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
              Open vacancies
            </h2>
            {preview && preview.items.length > 0 ? (
              <>
                <ViewerMarksProvider source={{ kind: "list", query: previewQuery(company.id), take: PREVIEW_COUNT }}>
                  <VacancyList vacancies={preview.items} now={preview.now} headingLevel="h3" />
                </ViewerMarksProvider>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="lg" className="w-fit">
                    <Link href={vacanciesHref({ companyId: company.id })}>
                      See all vacancies
                      <ArrowRightIcon aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-fit">
                    <Link href={pastHref}>Past vacancies</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  {company.openVacancies > 0 ? "The vacancies didn't load just now." : "No open vacancies right now."}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link
                    href={routes.vacancies}
                    className="inline-flex w-fit items-center gap-2 font-semibold text-cobalt-ink underline-offset-4 hover:underline"
                  >
                    Browse all vacancies
                  </Link>
                  <Link
                    href={pastHref}
                    className="inline-flex w-fit items-center gap-2 font-semibold text-cobalt-ink underline-offset-4 hover:underline"
                  >
                    Past vacancies
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
