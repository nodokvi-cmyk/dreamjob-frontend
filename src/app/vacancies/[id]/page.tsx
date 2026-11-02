import { ArrowLeftIcon, BriefcaseBusinessIcon, CheckIcon, MapPinIcon, TagIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ResultsError } from "@/components/vacancies/ListStates";
import { VacancyEmployer } from "@/components/vacancies/VacancyEmployer";
import { EndedBanner, PhotoGallery, VacancyTrack } from "@/components/vacancies/VacancyDetail";
import { routes } from "@/lib/routes";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  formatSalary,
  placeLabel,
  summary,
} from "@/lib/vacancy";
import { getVacancy } from "@/services/vacancies.service";
import type { Vacancy } from "@/types";

type Loaded = { kind: "found"; vacancy: Vacancy; now: number } | { kind: "missing" } | { kind: "failed" };

async function load(id: string): Promise<Loaded> {
  let vacancy: Vacancy | null;
  try {
    vacancy = await getVacancy(id);
  } catch {
    return { kind: "failed" };
  }
  if (!vacancy) return { kind: "missing" };
  await connection();
  return { kind: "found", vacancy, now: Date.now() };
}

function metaDescription(vacancy: Vacancy): string {
  const salary = formatSalary(vacancy) ?? "Salary not specified";
  const facts = `${placeLabel(vacancy)} · ${EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]} · ${salary}.`;
  return summary(`${facts} ${vacancy.description}`);
}

export async function generateMetadata({ params }: PageProps<"/vacancies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") return { title: "Vacancy not found", robots: { index: false } };
  if (loaded.kind === "failed") return { title: "Vacancy" };
  const { vacancy } = loaded;
  const description = metaDescription(vacancy);
  const photo = vacancy.photos[0];
  return {
    title: vacancy.title,
    description,
    robots: { index: vacancy.status === "published", follow: true },
    openGraph: {
      type: "website",
      siteName: "DreamJob",
      locale: "en_GB",
      title: vacancy.title,
      description,
      images: photo ? [{ url: photo.url, alt: vacancy.title }] : undefined,
    },
    twitter: {
      card: photo ? "summary_large_image" : "summary",
      title: vacancy.title,
      description,
    },
  };
}

export default async function VacancyPage({ params }: PageProps<"/vacancies/[id]">) {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") notFound();
  if (loaded.kind === "failed") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ResultsError
          title="This vacancy didn't load"
          body="We couldn't reach DreamJob just now. Check your connection, then try again."
        />
      </div>
    );
  }

  const { vacancy, now } = loaded;
  const salary = formatSalary(vacancy);

  return (
    <article className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-9 sm:px-6 md:pt-8 lg:px-8">
          <Link
            href={routes.vacancies}
            className="inline-flex w-fit items-center gap-2 rounded-md transit-label text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            All vacancies
          </Link>
          <EndedBanner status={vacancy.status} />
          <div className="flex max-w-4xl flex-col gap-5">
            <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[0.98] font-bold tracking-[-0.02em] break-words uppercase">
              {vacancy.title}
            </h1>
            <VacancyEmployer company={vacancy.company} size="lg" />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[1.02rem] text-muted-foreground">
              <li className="inline-flex items-center gap-2">
                <MapPinIcon aria-hidden className="size-[1.1rem] shrink-0" />
                {placeLabel(vacancy)}
              </li>
              <li className="inline-flex items-center gap-2">
                <BriefcaseBusinessIcon aria-hidden className="size-[1.1rem] shrink-0" />
                {EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]}
              </li>
              {vacancy.category ? (
                <li className="inline-flex items-center gap-2">
                  <TagIcon aria-hidden className="size-[1.1rem] shrink-0" />
                  {vacancy.category}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-10">
        <aside
          aria-label="Key facts"
          className="self-start rounded-2xl bg-enamel p-6 text-on-enamel sm:p-7 lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4 xl:col-start-9 dark:ring-1 dark:ring-enamel-seam"
        >
          <p className="transit-label text-[0.85rem] text-on-enamel-muted">Salary</p>
          {salary ? (
            <p className="mt-2 font-display text-[2.4rem] leading-none font-bold tracking-[-0.01em] tabular">
              {salary}
            </p>
          ) : (
            <p className="mt-2 text-lg text-on-enamel-muted">Salary not specified</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-enamel-seam pt-5">
            <Fact term="Location" value={vacancy.location.trim() || "Not specified"} />
            <Fact term="Work mode" value={WORK_MODE_LABELS[vacancy.workMode]} />
            <Fact term="Contract" value={EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]} />
            <Fact term="Category" value={vacancy.category || "Not specified"} />
          </dl>

          <div className="mt-6 border-t border-enamel-seam pt-6">
            <VacancyTrack vacancy={vacancy} now={now} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-12 lg:col-span-7 lg:row-start-1 xl:col-span-8 xl:pr-6">
          <PhotoGallery photos={vacancy.photos} title={vacancy.title} />

          <section aria-labelledby="about-title" className="flex flex-col gap-4">
            <h2 id="about-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
              About the role
            </h2>
            <p className="max-w-[70ch] text-[1.06rem] leading-[1.7] break-words whitespace-pre-line">
              {vacancy.description}
            </p>
          </section>

          {vacancy.requirements.length > 0 ? (
            <section aria-labelledby="requirements-title" className="flex flex-col gap-5">
              <h2
                id="requirements-title"
                className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase"
              >
                Requirements
              </h2>
              <ul className="flex max-w-[70ch] flex-col gap-3.5">
                {vacancy.requirements.map((requirement, index) => (
                  <li key={`${index}-${requirement}`} className="flex gap-3.5 text-[1.06rem] leading-relaxed">
                    <span
                      aria-hidden
                      className="mt-[0.3rem] grid size-[1.15rem] shrink-0 place-items-center rounded-full bg-foreground text-background"
                    >
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 break-words">{requirement}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="transit-label text-[0.78rem] text-on-enamel-muted">{term}</dt>
      <dd className="text-[1.02rem] font-medium break-words">{value}</dd>
    </div>
  );
}
