"use client";

import { useId, type ReactNode } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { Notice } from "@/components/profile/SaveRow";
import type { FormError } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  hint: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onLabel: string;
  offLabel: string;
  notice?: string | null;
  error?: FormError | null;
}

export function ToggleRow({ label, hint, checked, disabled, onToggle, onLabel, offLabel, notice, error }: ToggleRowProps) {
  const labelId = useId();
  const hintId = useId();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-5">
        <div className="flex flex-col gap-1">
          <p id={labelId} className="font-semibold">
            {label}
          </p>
          <p id={hintId} className="max-w-[56ch] text-sm text-muted-foreground">
            {hint}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelId}
          aria-describedby={hintId}
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            "relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "border-line-green bg-line-green" : "border-foreground/25 bg-muted",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-5 rounded-full border-[3px] bg-card shadow-[0_1px_2px_rgb(11_18_48/0.25)] transition-transform duration-200 ease-[var(--ease-out-expo)]",
              checked ? "translate-x-[21px] border-white" : "translate-x-[2px] border-foreground/40",
            )}
          />
        </button>
      </div>
      <p className="transit-label text-sm">
        <span className={checked ? "text-success-ink" : "text-muted-foreground"}>{checked ? onLabel : offLabel}</span>
      </p>
      <Notice message={notice ?? null} />
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
