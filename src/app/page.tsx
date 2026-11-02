import { ArrowRightIcon, MapPinIcon, SearchIcon } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { LatestVacancies } from "@/components/vacancies/LatestVacancies";
import { companySignUpHref } from "@/lib/account";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { LOCATION_MAX, QUERY_MAX, vacanciesHref } from "@/lib/vacancyQuery";
import type { VacancyQuery } from "@/types";

const STATIONS = [
  {
    name: "Pending review",
    detail: "The company submits a vacancy. Our team checks it first.",
  },
  {
    name: "Published",
    detail: "Approved vacancies go live with their salary range and deadline.",
  },
  {
    name: "Closed",
    detail: "Filled or past the deadline. It leaves the search on its own.",
  },
];

const PRINCIPLES = [
  {
    ink: "bg-line-green",
    title: "Verified employers",
    body: "A company can only publish after an admin approves it, and each vacancy is reviewed before it goes live.",
  },
  {
    ink: "bg-line-amber",
    title: "Pay up front",
    body: "Salary ranges sit on the listing in GEL, USD or EUR. Filter by the pay you need and sort by it.",
  },
  {
    ink: "bg-line-cobalt",
    title: "Search that stays out of the way",
    body: "Type a role, pick a city or remote, and read the list. Work mode, contract type and deadline on every row.",
  },
];

const SHORTCUTS: { label: string; query: VacancyQuery }[] = [
  { label: "Remote", query: { workMode: "remote" } },
  { label: "Internship", query: { employmentType: "internship" } },
  { label: "Part-time", query: { employmentType: "part-time" } },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pt-12 pb-16 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="flex flex-col gap-7 lg:col-span-7">
            <h1 className="font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Verified employers.
              <br />
              Pay you can see.
              <br />
              <span className="text-line-scarlet">Your next stop.</span>
            </h1>
            <p className="max-w-[34rem] text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Vacancies across Georgia from companies our team has approved, with the salary right
              on the listing.
            </p>

            <Form
              action={routes.vacancies}
              role="search"
              className="flex w-full max-w-2xl flex-col gap-2 rounded-xl border-2 border-foreground bg-card p-2 shadow-[0_18px_40px_-24px_rgb(11_18_48/0.45)] sm:flex-row sm:items-center sm:gap-0"
            >
              <label className="flex flex-1 items-center gap-3 px-3">
                <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">Job title or keyword</span>
                <input
                  name="q"
                  type="search"
                  maxLength={QUERY_MAX}
                  placeholder="Job title or keyword"
                  className="h-12 w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground"
                />
              </label>
              <span aria-hidden className="hidden h-8 w-px bg-border sm:block" />
              <label className="flex items-center gap-3 border-t border-border px-3 sm:w-52 sm:border-t-0">
                <MapPinIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">City</span>
                <input
                  name="location"
                  maxLength={LOCATION_MAX}
                  placeholder="City"
                  className="h-12 w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground"
                />
              </label>
              <Button type="submit" size="lg" className="sm:ml-1">
                Search
                <ArrowRightIcon aria-hidden />
              </Button>
            </Form>

            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>Try</span>
              {SHORTCUTS.map((shortcut) => (
                <Link
                  key={shortcut.label}
                  href={vacanciesHref(shortcut.query)}
                  className="rounded-full border border-border px-3 py-1 font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-muted"
                >
                  {shortcut.label}
                </Link>
              ))}
            </p>
          </div>

          <aside
            aria-labelledby="journey-title"
            className="relative rounded-2xl bg-enamel p-6 text-on-enamel sm:p-8 lg:col-span-5 lg:self-end dark:ring-1 dark:ring-enamel-seam"
          >
            <h2 id="journey-title" className="font-display text-2xl font-bold tracking-[-0.01em] uppercase">
              How a vacancy travels
            </h2>
            <p className="mt-2 text-[0.95rem] text-on-enamel-muted">
              Nothing reaches the list without passing review.
            </p>
            <ol className="mt-7 flex flex-col gap-7">
              {STATIONS.map((station, index) => (
                <li key={station.name} className="relative flex gap-5">
                  {index < STATIONS.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-5 -bottom-8 left-[11px] w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-on-enamel/20"
                    >
                      {index === 0 ? (
                        <span className="block h-full w-full origin-top bg-line-scarlet motion-safe:animate-[fill-line_1.1s_var(--ease-out-expo)_0.3s_both]" />
                      ) : null}
                    </span>
                  ) : null}
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-[5px]",
                      index === 0 && "border-line-scarlet bg-line-scarlet",
                      index === 1 &&
                        "border-on-enamel bg-line-scarlet motion-safe:animate-[arrive_1.1s_ease-out_1.1s_both]",
                      index === 2 && "border-on-enamel/40 bg-enamel",
                    )}
                  />
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "transit-label text-lg leading-none",
                        index === 2 && "text-on-enamel-muted",
                      )}
                    >
                      {station.name}
                    </span>
                    <span className="text-[0.95rem] leading-snug text-on-enamel-muted">
                      {station.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <div aria-hidden className="mt-8 flex gap-1.5">
              <span className="h-1.5 flex-1 rounded-full bg-line-scarlet" />
              <span className="h-1.5 flex-1 rounded-full bg-line-cobalt" />
              <span className="h-1.5 flex-1 rounded-full bg-line-amber" />
              <span className="h-1.5 flex-1 rounded-full bg-line-green" />
            </div>
          </aside>
        </div>
      </section>

      <Suspense fallback={null}>
        <LatestVacancies />
      </Suspense>

      <section aria-labelledby="principles-title" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 id="principles-title" className="sr-only">
          Why DreamJob
        </h2>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title} className="flex flex-col gap-4">
              <span aria-hidden className="flex items-center">
                <span className={cn("h-1.5 w-12 rounded-full", principle.ink)} />
                <span className="-ml-1 size-4 rounded-full border-4 border-foreground bg-background" />
              </span>
              <h3 className="font-display text-2xl font-bold tracking-[-0.01em] uppercase">
                {principle.title}
              </h3>
              <p className="max-w-[38ch] leading-relaxed text-muted-foreground">{principle.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="font-display text-3xl font-bold tracking-[-0.01em] uppercase sm:text-4xl">
              Hiring in Georgia?
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Create a company account, get approved once, and follow every vacancy from pending
              review to published.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={companySignUpHref}>
                Create a company account
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.vacancies}>Browse vacancies</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
