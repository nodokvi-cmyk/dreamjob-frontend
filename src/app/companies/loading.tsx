import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div role="status" aria-label="Loading companies">
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex max-w-5xl flex-col gap-6">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Companies
            </h1>
            <Skeleton className="h-[60px] w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex items-center justify-between gap-6">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-9 w-52" />
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-[132px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
