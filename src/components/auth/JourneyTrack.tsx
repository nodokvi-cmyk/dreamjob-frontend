import { cn } from "@/lib/utils";

export interface Station {
  name: string;
  detail: string;
}

interface JourneyTrackProps {
  stations: readonly Station[];
  current: number;
  className?: string;
  label?: string;
}

function stateOf(index: number, current: number): "done" | "here" | "next" {
  if (index < current) return "done";
  if (index === current) return "here";
  return "next";
}

const SR_STATE = { done: "Done", here: "Current step", next: "Coming up" };

export function JourneyLine({ stations, current, className, label = "Steps" }: JourneyTrackProps) {
  return (
    <ol
      aria-label={label}
      className={cn("grid", className)}
      style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0, 1fr))` }}
    >
      {stations.map((station, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={station.name}
            aria-current={state === "here" ? "step" : undefined}
            className="relative flex flex-col gap-2.5 pr-2"
          >
            {index < stations.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-2 right-0 left-4 h-1.5 rounded-full",
                  state === "done" ? "bg-line-scarlet" : "bg-foreground/15",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 size-[22px] rounded-full border-[5px]",
                state === "done" && "border-line-scarlet bg-line-scarlet",
                state === "here" && "border-foreground bg-line-scarlet",
                state === "next" && "border-foreground/25 bg-background",
              )}
            />
            <span
              className={cn(
                "transit-label text-xs leading-tight sm:text-sm",
                state === "next" && "text-muted-foreground",
              )}
            >
              <span className="sr-only">{SR_STATE[state]}: </span>
              {station.name}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function JourneyTrack({ stations, current, className }: JourneyTrackProps) {
  return (
    <ol aria-label="Steps" className={cn("flex flex-col gap-7", className)}>
      {stations.map((station, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={station.name}
            aria-current={state === "here" ? "step" : undefined}
            className="relative flex gap-5"
          >
            {index < stations.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-5 -bottom-8 left-[11px] w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-on-enamel/20"
              >
                {state === "done" ? (
                  <span className="block h-full w-full origin-top bg-line-scarlet motion-safe:animate-[fill-line_0.9s_var(--ease-out-expo)_0.2s_both]" />
                ) : null}
              </span>
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-[5px]",
                state === "done" && "border-line-scarlet bg-line-scarlet",
                state === "here" &&
                  "border-on-enamel bg-line-scarlet motion-safe:animate-[arrive_1.1s_ease-out_0.7s_both]",
                state === "next" && "border-on-enamel/40 bg-enamel",
              )}
            />
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "transit-label text-lg leading-none",
                  state === "next" && "text-on-enamel-muted",
                )}
              >
                <span className="sr-only">{SR_STATE[state]}: </span>
                {station.name}
              </span>
              <span className="text-[0.95rem] leading-snug text-on-enamel-muted">
                {station.detail}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
