import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Salary } from "@/components/vacancies/Salary";
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from "@/lib/vacancy";
import type { Publication } from "@/types";

export type PublicationContent = Pick<
  Publication,
  | "title"
  | "about"
  | "category"
  | "employmentTypes"
  | "workModes"
  | "locations"
  | "salaryMin"
  | "salaryMax"
  | "currency"
  | "skills"
  | "experienceYears"
>;

export function experienceText(years: number | null): string {
  if (years === null) return "Not stated";
  if (years === 0) return "Less than a year";
  return years === 1 ? "1 year" : `${years} years`;
}

function anyOr(labels: string[], fallback: string): string {
  return labels.length > 0 ? labels.join(", ") : fallback;
}

interface PublicationViewProps {
  publication: PublicationContent;
  back: { href: string; label: string };
  status?: ReactNode;
  strip?: ReactNode;
  panel?: ReactNode;
}

export function PublicationView({ publication, back, status, strip, panel }: PublicationViewProps) {
  return (
    <article className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-6 pb-8 sm:px-6 md:pt-8 lg:px-8">
          <Link
            href={back.href}
            className="inline-flex w-fit items-center gap-2 rounded-md transit-label text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            {back.label}
          </Link>
          <div className="flex max-w-4xl flex-col gap-4">
            <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[0.98] font-bold tracking-[-0.02em] break-words uppercase">
              {publication.title}
            </h1>
            {status}
          </div>
          {strip}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-10">
        <aside
          aria-label="Key facts"
          className="self-start rounded-2xl bg-enamel p-6 text-on-enamel sm:p-7 lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4 xl:col-start-9 dark:ring-1 dark:ring-enamel-seam"
        >
          <p className="transit-label text-[0.85rem] text-on-enamel-muted">Desired pay</p>
          <p className="mt-2">
            <Salary
              range={publication}
              className="text-[2.4rem] tracking-[-0.01em]"
              negotiableClassName="text-on-enamel-muted"
            />
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-enamel-seam pt-5">
            <Fact term="Category" value={publication.category || "Not specified"} />
            <Fact term="Experience" value={experienceText(publication.experienceYears)} />
            <Fact
              term="Work mode"
              value={anyOr(publication.workModes.map((mode) => WORK_MODE_LABELS[mode]), "Any")}
            />
            <Fact
              term="Contract"
              value={anyOr(publication.employmentTypes.map((type) => EMPLOYMENT_TYPE_LABELS[type]), "Any")}
            />
            <div className="col-span-2">
              <Fact term="Locations" value={anyOr(publication.locations, "Any location")} />
            </div>
          </dl>

          {panel ? <div className="mt-6 border-t border-enamel-seam pt-6">{panel}</div> : null}
        </aside>

        <div className="flex min-w-0 flex-col gap-12 lg:col-span-7 lg:row-start-1 xl:col-span-8 xl:pr-6">
          <section aria-labelledby="about-title" className="flex flex-col gap-4">
            <h2 id="about-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
              About
            </h2>
            <p className="max-w-[70ch] text-[1.06rem] leading-[1.7] break-words whitespace-pre-line">
              {publication.about}
            </p>
          </section>

          {publication.skills.length > 0 ? (
            <section aria-labelledby="skills-title" className="flex flex-col gap-5">
              <h2 id="skills-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
                Skills
              </h2>
              <ul className="flex max-w-[70ch] flex-wrap gap-2">
                {publication.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[0.95rem] font-medium break-words"
                  >
                    {skill}
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

export function PublicationSkeleton({ label = "Loading publication" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-6 pb-8 sm:px-6 md:pt-8 lg:px-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-[min(36rem,90%)]" />
          <Skeleton className="h-7 w-40" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[80%]" />
        </div>
        <Skeleton className="h-72 rounded-2xl lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9" />
      </div>
    </div>
  );
}
