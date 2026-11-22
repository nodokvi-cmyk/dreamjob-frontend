import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VacancyList } from "@/components/vacancies/VacancyList";
import { ViewerMarksProvider } from "@/components/vacancies/ViewerMarks";
import { vacanciesHref } from "@/lib/vacancyQuery";
import { listVacancies } from "@/services/publicVacancies.service";
import type { VacancyCard, VacancyQuery } from "@/types";

const SIMILAR_SHOWN = 3;
const SIMILAR_TAKE = SIMILAR_SHOWN + 1;

async function loadSimilar(query: VacancyQuery, excludeId: string): Promise<VacancyCard[]> {
  try {
    const page = await listVacancies(query, SIMILAR_TAKE);
    return page.items.filter((item) => item.id !== excludeId).slice(0, SIMILAR_SHOWN);
  } catch {
    return [];
  }
}

export async function SimilarVacancies({
  id,
  category,
  now,
}: {
  id: string;
  category: string;
  now: number;
}) {
  if (!category) return null;
  const query: VacancyQuery = { category, sort: "-date" };
  const items = await loadSimilar(query, id);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="similar-title" className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h2
            id="similar-title"
            className="font-display text-3xl font-bold tracking-[-0.01em] uppercase sm:text-4xl"
          >
            More in {category}
          </h2>
          <Button asChild variant="outline" size="lg">
            <Link href={vacanciesHref({ category })}>
              See all {category}
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="max-w-5xl">
          <ViewerMarksProvider source={{ kind: "list", query, take: SIMILAR_TAKE }}>
            <VacancyList vacancies={items} now={now} headingLevel="h3" />
          </ViewerMarksProvider>
        </div>
      </div>
    </section>
  );
}
