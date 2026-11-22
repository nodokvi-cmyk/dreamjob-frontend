import { NEGOTIABLE, formatSalary, type SalaryRange } from "@/lib/vacancy";
import { cn } from "@/lib/utils";

export function Salary({
  range,
  className,
  negotiableClassName,
}: {
  range: SalaryRange;
  className?: string;
  negotiableClassName?: string;
}) {
  const salary = formatSalary(range);
  if (salary === null) {
    return (
      <span className={cn("font-display leading-none font-bold tabular text-muted-foreground", className, negotiableClassName)}>
        {NEGOTIABLE}
      </span>
    );
  }
  return <span className={cn("font-display leading-none font-bold tabular", className)}>{salary}</span>;
}
