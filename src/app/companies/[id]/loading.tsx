import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyLoading() {
  return (
    <div role="status" aria-label="Loading company" className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 pb-9 sm:flex-row sm:items-center sm:gap-8 sm:px-6 md:pt-12 lg:px-8">
          <Skeleton className="size-32 rounded-[17px]" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-80 max-w-full" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl lg:col-span-5 lg:col-start-8" />
      </div>
    </div>
  );
}
