import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { cn } from "@/lib/utils";

export interface EmployerInfo {
  companyName: string;
  logoUrl: string;
  approved: boolean;
  href?: string;
}

interface VacancyEmployerProps {
  employer: EmployerInfo;
  size: "sm" | "lg";
  tone?: "surface" | "enamel";
  logo?: boolean;
  className?: string;
}

export const UNAPPROVED_COMPANY = "This company currently has no approved status";

export function CompanyWarning({ tone = "surface", className }: { tone?: "surface" | "enamel"; className?: string }) {
  return (
    <span className={cn("inline-flex items-start gap-1.5 text-sm", tone === "enamel" ? "text-on-enamel" : "text-foreground", className)}>
      <TriangleAlertIcon aria-hidden className="mt-px size-4 shrink-0 text-line-amber" strokeWidth={2.25} />
      {UNAPPROVED_COMPANY}
    </span>
  );
}

export function VacancyEmployer({ employer, size, tone = "surface", logo = true, className }: VacancyEmployerProps) {
  const name = employer.companyName.trim() || "Company";
  const linked = employer.approved && employer.href;
  const nameClass = cn(
    "truncate",
    size === "sm" ? "text-[0.95rem] font-medium" : "text-lg font-semibold",
    tone === "enamel" ? "text-on-enamel" : "text-foreground",
  );

  return (
    <span className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={cn("flex min-w-0 items-center", size === "sm" ? "gap-2" : "gap-3.5")}>
        {logo ? (
          <AccountPhoto
            src={employer.logoUrl}
            kind="company"
            alt=""
            size={size === "sm" ? "xs" : "md"}
            fit="contain"
          />
        ) : null}
        {linked ? (
          <Link
            href={linked}
            className={cn(
              nameClass,
              "relative z-10 rounded-sm underline-offset-4 hover:underline hover:decoration-line-scarlet hover:decoration-2",
            )}
          >
            {name}
          </Link>
        ) : (
          <span className={nameClass}>{name}</span>
        )}
      </span>
      {employer.approved ? null : <CompanyWarning tone={tone} />}
    </span>
  );
}
