import { VacancyCardRow } from "@/components/vacancies/VacancyCard";
import type { VacancyCard } from "@/types";

interface VacancyListProps {
  vacancies: VacancyCard[];
  now: number;
  headingLevel?: "h2" | "h3";
  onBookmarkChange?: (vacancyId: string, bookmarked: boolean) => void;
}

export function VacancyList({ vacancies, now, headingLevel = "h2", onBookmarkChange }: VacancyListProps) {
  return (
    <ol className="relative flex flex-col">
      <span
        aria-hidden
        className="absolute top-6 bottom-6 left-[11px] w-1.5 -translate-x-1/2 rounded-full bg-border sm:left-[15px]"
      />
      {vacancies.map((vacancy) => (
        <li key={vacancy.id} className="relative">
          <VacancyCardRow vacancy={vacancy} now={now} headingLevel={headingLevel} onBookmarkChange={onBookmarkChange} />
        </li>
      ))}
    </ol>
  );
}
