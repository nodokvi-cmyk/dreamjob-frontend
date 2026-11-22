import { MAX_RATING, RATING_VALUES, fillPercent, ratingLabel } from "@/lib/rating";
import { cn } from "@/lib/utils";

const STAR_POINTS = "12 2.6 14.9 8.6 21.5 9.5 16.7 14.1 17.9 20.7 12 17.6 6.1 20.7 7.3 14.1 2.5 9.5 9.1 8.6";

export function StarShape({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("shrink-0", className)}>
      <polygon
        points={STAR_POINTS}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type StarsSize = "sm" | "md" | "lg";

const SIZE: Record<StarsSize, string> = {
  sm: "size-3.5",
  md: "size-[1.15rem]",
  lg: "size-6",
};

function Row({ size }: { size: StarsSize }) {
  return (
    <span aria-hidden className="flex w-max">
      {RATING_VALUES.map((value) => (
        <StarShape key={value} className={SIZE[size]} />
      ))}
    </span>
  );
}

interface StarsProps {
  rating: number | null;
  size?: StarsSize;
  className?: string;
}

export function Stars({ rating, size = "md", className }: StarsProps) {
  if (rating === null) return null;
  const shown = Math.min(MAX_RATING, Math.max(0, rating));

  return (
    <span
      role="img"
      aria-label={ratingLabel(shown)}
      className={cn("relative inline-flex shrink-0 align-middle", className)}
    >
      <span className="text-foreground/20">
        <Row size={size} />
      </span>
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full overflow-hidden text-foreground"
        style={{ width: `${fillPercent(shown)}%` }}
      >
        <Row size={size} />
      </span>
    </span>
  );
}
