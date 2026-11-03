import {
  ArrowLeftIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  CircleSlashIcon,
  ExternalLinkIcon,
  MapPinIcon,
  TagIcon,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { VacancyEmployer } from "@/components/vacancies/VacancyEmployer";
import { VacancyPhoto } from "@/components/vacancies/VacancyPhoto";
import { cn } from "@/lib/utils";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  deadlineInfo,
  formatDate,
  formatSalary,
  placeLabel,
} from "@/lib/vacancy";
import type { Vacancy } from "@/types";

export function EndedBanner({ status }: { status: Vacancy["status"] }) {
  if (status !== "closed" && status !== "expired") return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-foreground/15 bg-muted px-4 py-3.5 sm:items-center"
    >
      <CircleSlashIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground sm:mt-0" />
      <p className="text-[1.02rem]">
        <span className="font-semibold">
          {status === "closed" ? "This vacancy is closed." : "This vacancy has expired."}
        </span>{" "}
        <span className="text-muted-foreground">
          {status === "closed"
            ? "The employer closed it. The details stay here for reference."
            : "Its deadline has passed. The details stay here for reference."}
        </span>
      </p>
    </div>
  );
}

function travelled(vacancy: Vacancy, now: number): number {
  if (vacancy.status === "closed" || vacancy.status === "expired") return 1;
  const start = Date.parse(vacancy.createdAt);
  const end = Date.parse(vacancy.deadline);
  if (end <= start) return 1;
  return Math.min(1, Math.max(0.06, (now - start) / (end - start)));
}

export function VacancyTrack({ vacancy, now }: { vacancy: Vacancy; now: number }) {
  const deadline = deadlineInfo(vacancy, now);
  const ended = deadline.tone === "ended";
  const share = travelled(vacancy, now);
  const endName =
    vacancy.status === "closed" ? "Closed" : ended ? "Expired" : "Closes";

  return (
    <ol aria-label="Vacancy timeline" className="flex flex-col gap-7">
      <li className="relative flex gap-4">
        <span
          aria-hidden
          className="absolute top-5 -bottom-8 left-[11px] w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-on-enamel/20"
        >
          <span
            className="block w-full origin-top rounded-full bg-line-scarlet motion-safe:animate-[fill-line_1.1s_var(--ease-out-expo)_0.2s_both]"
            style={{ height: `${share * 100}%` }}
          />
        </span>
        <span
          aria-hidden
          className="relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-[5px] border-line-scarlet bg-line-scarlet"
        />
        <span className="flex flex-col gap-1">
          <span className="transit-label text-base leading-none">Posted</span>
          <time dateTime={vacancy.createdAt} className="text-[0.95rem] text-on-enamel-muted">
            {formatDate(vacancy.createdAt)}
          </time>
        </span>
      </li>
      <li className="relative flex gap-4">
        <span
          aria-hidden
          className={cn(
            "relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-[5px]",
            ended
              ? "border-on-enamel bg-line-scarlet motion-safe:animate-[arrive_1.1s_ease-out_1s_both]"
              : deadline.tone === "soon"
                ? "border-line-amber bg-enamel"
                : "border-on-enamel/45 bg-enamel",
          )}
        />
        <span className="flex flex-col gap-1">
          <span className={cn("transit-label text-base leading-none", !ended && "text-on-enamel-muted")}>
            {endName} <time dateTime={vacancy.deadline}>{formatDate(vacancy.deadline)}</time>
          </span>
          {ended ? null : (
            <span
              className={cn(
                "text-[0.95rem]",
                deadline.tone === "soon" ? "font-medium text-line-amber" : "text-on-enamel-muted",
              )}
            >
              {deadline.label}
            </span>
          )}
        </span>
      </li>
    </ol>
  );
}

export function PhotoGallery({ photos, title }: { photos: Vacancy["photos"]; title: string }) {
  if (photos.length === 0) return null;
  const count = photos.length;

  return (
    <section aria-label="Photos">
      <ul className={cn("grid gap-3", count > 1 && "grid-cols-2")}>
        {photos.map((photo, index) => {
          const wide = count === 1 || (count === 3 && index === 0);
          return (
            <li key={photo.id} className={cn(wide && count === 3 && "col-span-2")}>
              <a
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/photo relative block overflow-hidden rounded-xl border border-border bg-muted",
                  wide ? "aspect-[16/9]" : "aspect-[4/3]",
                )}
              >
                <VacancyPhoto
                  src={photo.url}
                  alt={`${title}, photo ${index + 1} of ${count}`}
                  width={wide ? 1200 : 800}
                  height={wide ? 675 : 600}
                  priority={index === 0}
                  className="transition-transform duration-500 ease-out group-hover/photo:scale-[1.02]"
                />
                <span className="absolute right-2.5 bottom-2.5 grid size-8 place-items-center rounded-lg bg-enamel/80 text-on-enamel opacity-0 transition-opacity group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100">
                  <ExternalLinkIcon aria-hidden className="size-4" />
                </span>
                <span className="sr-only">Open full size in a new tab</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface VacancyDetailViewProps {
  vacancy: Vacancy;
  now: number;
  back: { href: string; label: string };
}

export function VacancyDetailView({ vacancy, now, back }: VacancyDetailViewProps) {
  const salary = formatSalary(vacancy);

  return (
    <article className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-9 sm:px-6 md:pt-8 lg:px-8">
          <Link
            href={back.href}
            className="inline-flex w-fit items-center gap-2 rounded-md transit-label text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            {back.label}
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
            <p className="mt-2 text-lg text-on-enamel-muted">Salary by agreement</p>
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

export function VacancyDetailSkeleton({ label = "Loading vacancy" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-9 sm:px-6 md:pt-8 lg:px-8">
          <Skeleton className="h-4 w-32" />
          <div className="flex max-w-4xl flex-col gap-5">
            <Skeleton className="h-12 w-[min(36rem,90%)]" />
            <Skeleton className="h-12 w-[min(24rem,70%)]" />
            <div className="flex items-center gap-3.5">
              <Skeleton className="size-14 rounded-[12px]" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-5 w-[min(26rem,85%)]" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-10">
        <div className="h-[22rem] rounded-2xl bg-enamel lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4 xl:col-start-9 dark:ring-1 dark:ring-enamel-seam" />
        <div className="flex flex-col gap-4 lg:col-span-7 lg:row-start-1 xl:col-span-8">
          <Skeleton className="h-7 w-48" />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-4" style={{ width: `${92 - index * 7}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
