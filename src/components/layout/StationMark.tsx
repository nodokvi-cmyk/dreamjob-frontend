import { cn } from "@/lib/utils";

export function StationMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-9 shrink-0", className)}
    >
      <path
        d="M3 29H10V22H17V15H24V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="miter"
      />
      <path d="M24 2L30 10.5H18Z" fill="var(--line-scarlet)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <StationMark />
      <span className="flex flex-col gap-[3px]">
        <span className="font-display pl-px text-[0.7rem] leading-none font-semibold tracking-[0.36em] text-line-scarlet uppercase">
          Get
        </span>
        <span className="font-display text-[1.6rem] leading-[0.95] font-bold tracking-[0.005em]">
          DreamJob
        </span>
      </span>
    </span>
  );
}
