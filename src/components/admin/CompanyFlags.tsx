import { cn } from "@/lib/utils";
import type { Company } from "@/types";

function Flag({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <li
      className={cn(
        "inline-flex h-7 w-fit items-center gap-2 rounded-full border border-border bg-card pr-3 pl-2 transit-label text-[0.8rem] leading-none",
        !on && "text-muted-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-3 rounded-full border-[3px]",
          on ? "border-line-green bg-line-green" : "border-line-amber bg-transparent",
        )}
      />
      {on ? onLabel : offLabel}
    </li>
  );
}

export function CompanyFlags({
  company,
}: {
  company: Pick<Company, "approved" | "isVerified" | "isProfileComplete">;
}) {
  return (
    <ul aria-label="Company status" className="flex flex-wrap gap-2">
      <Flag on={company.approved} onLabel="Approved" offLabel="Not approved" />
      <Flag on={company.isVerified} onLabel="Email verified" offLabel="Email not verified" />
      <Flag on={company.isProfileComplete} onLabel="Profile complete" offLabel="Profile incomplete" />
    </ul>
  );
}
