import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  id: string;
  title: string;
  lead?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
}

export function ProfileSection({ id, title, lead, tone = "default", children }: ProfileSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "scroll-mt-36 border-t pt-8 lg:scroll-mt-28",
        tone === "danger" ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="flex max-w-[62ch] flex-col gap-2">
        <h2
          id={titleId}
          className={cn(
            "font-display text-2xl leading-none font-bold tracking-[-0.01em] uppercase",
            tone === "danger" && "text-destructive",
          )}
        >
          {title}
        </h2>
        {lead ? <div className="text-muted-foreground">{lead}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
