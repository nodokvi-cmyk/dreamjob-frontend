import type { ReactNode } from "react";
import { JourneyLine, JourneyTrack, type Station } from "@/components/auth/JourneyTrack";
import { cn } from "@/lib/utils";

export interface Journey {
  stations: readonly Station[];
  current: number;
  note?: string;
}

interface AuthShellProps {
  title: string;
  lead?: ReactNode;
  journey?: Journey;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, lead, journey, footer, children }: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className={cn("grid gap-10", journey && "lg:grid-cols-12 lg:gap-12")}>
        <section
          aria-labelledby="auth-title"
          className={cn(
            "w-full max-w-md",
            journey ? "mx-auto lg:col-span-6 lg:col-start-2 lg:mx-0 lg:justify-self-end" : "mx-auto",
          )}
        >
          {journey ? (
            <JourneyLine stations={journey.stations} current={journey.current} className="mb-9 lg:hidden" />
          ) : null}
          <h1
            id="auth-title"
            className="font-display text-4xl leading-[0.95] font-bold tracking-[-0.02em] uppercase sm:text-5xl"
          >
            {title}
          </h1>
          {lead ? (
            <div className="mt-3 text-lg leading-relaxed text-muted-foreground">{lead}</div>
          ) : null}
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="mt-10 border-t border-border pt-6 text-[0.95rem] text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </section>

        {journey ? (
          <aside
            aria-label="Your route"
            className="sticky top-28 hidden self-start rounded-2xl bg-enamel p-8 text-on-enamel lg:col-span-4 lg:col-start-8 lg:block dark:ring-1 dark:ring-enamel-seam"
          >
            <p className="font-display text-2xl font-bold tracking-[-0.01em] uppercase">Your route</p>
            <JourneyTrack stations={journey.stations} current={journey.current} className="mt-7" />
            {journey.note ? (
              <p className="mt-8 border-t border-enamel-seam pt-5 text-[0.95rem] leading-snug text-on-enamel-muted">
                {journey.note}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
