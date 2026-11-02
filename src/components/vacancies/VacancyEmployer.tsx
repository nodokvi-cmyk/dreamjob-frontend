import { Building2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vacancy } from "@/types";

interface VacancyEmployerProps {
  company: Vacancy["company"];
  size: "sm" | "lg";
  tone?: "surface" | "enamel";
  className?: string;
}

const TILE = {
  sm: "size-7 rounded-[7px] border-b-2 [&_svg]:size-3.5",
  lg: "size-14 rounded-[12px] border-b-4 [&_svg]:size-6",
};

export function VacancyEmployer({ company, size, tone = "surface", className }: VacancyEmployerProps) {
  return (
    <span
      data-company={company}
      className={cn("flex min-w-0 items-center", size === "sm" ? "gap-2" : "gap-3.5", className)}
    >
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center border-line-scarlet bg-enamel text-on-enamel-muted dark:ring-1 dark:ring-enamel-seam",
          TILE[size],
        )}
      >
        <Building2Icon />
      </span>
      <span
        className={cn(
          "truncate",
          size === "sm" ? "text-[0.95rem] font-medium" : "text-lg font-semibold",
          tone === "enamel" ? "text-on-enamel" : "text-foreground",
        )}
      >
        Employer
      </span>
    </span>
  );
}
