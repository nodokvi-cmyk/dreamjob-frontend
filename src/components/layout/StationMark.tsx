import { cn } from "@/lib/utils";

export function StationMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <path d="M0 16h32" stroke="var(--line-scarlet)" strokeWidth="5" />
      <circle cx="16" cy="16" r="10" fill="var(--enamel)" stroke="currentColor" strokeWidth="4" />
      <circle cx="16" cy="16" r="3.5" fill="var(--line-scarlet)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <StationMark />
      <span className="font-display text-[1.6rem] leading-none font-bold tracking-[-0.01em] uppercase">
        DreamJob
      </span>
    </span>
  );
}
