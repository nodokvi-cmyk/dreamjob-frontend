import { Skeleton } from "@/components/ui/skeleton";

export default function VacancyLoading() {
  return (
    <div role="status" aria-label="Loading vacancy" className="flex flex-1 flex-col">
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
