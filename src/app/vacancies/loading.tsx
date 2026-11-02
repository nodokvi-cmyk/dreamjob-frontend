import { VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Skeleton } from "@/components/ui/skeleton";

export default function VacanciesLoading() {
  return (
    <div role="status" aria-label="Loading vacancies">
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex max-w-5xl flex-col gap-6">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Vacancies
            </h1>
            <Skeleton className="h-[60px] w-full rounded-xl" />
            <div className="hidden grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.35fr)] gap-3 md:grid">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-11 w-full rounded-[10px]" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-28 rounded-lg md:hidden" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex items-center justify-between gap-6">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-9 w-52" />
          </div>
          <VacancyListSkeleton />
        </div>
      </div>
    </div>
  );
}
