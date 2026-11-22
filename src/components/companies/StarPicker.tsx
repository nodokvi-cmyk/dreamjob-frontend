"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { StarShape } from "@/components/companies/Stars";
import { MAX_RATING, RATING_VALUES } from "@/lib/rating";
import { cn } from "@/lib/utils";

interface StarPickerProps {
  value: number | null;
  disabled: boolean;
  label: string;
  onPick: (stars: number) => void;
}

function targetFor(key: string, from: number): number | null {
  if (key === "ArrowRight" || key === "ArrowUp") return Math.min(MAX_RATING, from + 1);
  if (key === "ArrowLeft" || key === "ArrowDown") return Math.max(1, from - 1);
  if (key === "Home") return 1;
  if (key === "End") return MAX_RATING;
  return null;
}

export function StarPicker({ value, disabled, label, onPick }: StarPickerProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const group = useRef<HTMLDivElement>(null);

  const preview = disabled ? (value ?? 0) : (hover ?? cursor ?? value ?? 0);
  const tabbable = cursor ?? value ?? 1;

  function pick(stars: number) {
    setCursor(null);
    if (disabled) return;
    onPick(stars);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    const next = targetFor(event.key, current);
    if (next === null) return;
    event.preventDefault();
    if (disabled) return;
    setCursor(next);
    group.current?.querySelectorAll<HTMLElement>("[role=radio]")[next - 1]?.focus();
  }

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled}
      className="flex w-fit"
      onMouseLeave={() => setHover(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setCursor(null);
      }}
    >
      {RATING_VALUES.map((stars) => (
        <button
          key={stars}
          type="button"
          role="radio"
          aria-checked={value === stars}
          aria-label={`${stars} ${stars === 1 ? "star" : "stars"}`}
          aria-disabled={disabled}
          tabIndex={tabbable === stars ? 0 : -1}
          onClick={() => pick(stars)}
          onKeyDown={(event) => onKeyDown(event, stars)}
          onMouseEnter={() => setHover(stars)}
          className={cn(
            "grid size-10 place-items-center rounded-lg outline-none transition-colors duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/50",
            disabled ? "cursor-progress opacity-60" : "cursor-pointer",
            preview >= stars ? "text-foreground" : "text-foreground/20",
          )}
        >
          <StarShape className="size-7" />
        </button>
      ))}
    </div>
  );
}
