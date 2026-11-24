import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { VacancyList } from "@/components/vacancies/VacancyList";
import { ViewerMarksProvider } from "@/components/vacancies/ViewerMarks";
import { routes } from "@/lib/routes";
import { listLatestVacancies } from "@/services/publicVacancies.service";
import type { VacancyCard, VacancyQuery } from "@/types";

const MARKS_COUNT = 10;

const LATEST_QUERY: VacancyQuery = { sort: "-date" };

async function loadLatest(): Promise<{ items: VacancyCard[]; now: number } | null> {
  try {
    const items = await listLatestVacancies();
    return { items, now: Date.now() };
  } catch {
    return null;
  }
}

export async function LatestVacancies() {
  await connection();
  const loaded = await loadLatest();
  if (!loaded || loaded.items.length === 0) return null;
  const { items, now } = loaded;

  return (
    <section aria-labelledby="latest-title" className="border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
        <div className="flex flex-col items-start gap-4 lg:col-span-4">
          <h2 id="latest-title" className="font-display text-3xl font-bold tracking-[-0.01em] uppercase sm:text-4xl">
            Latest vacancies
          </h2>
          <p className="max-w-[34ch] text-lg leading-relaxed text-muted-foreground">
            Newly published, each one reviewed by our team, with pay and deadline on the row.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-2">
            <Link href={routes.vacancies}>
              All vacancies
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="lg:col-span-8">
          <ViewerMarksProvider source={{ kind: "list", query: LATEST_QUERY, take: MARKS_COUNT }}>
            <VacancyList vacancies={items} now={now} headingLevel="h3" />
          </ViewerMarksProvider>
        </div>
      </div>
    </section>
  );
}
