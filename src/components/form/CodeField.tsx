"use client";

import { useId, type ChangeEvent } from "react";
import { FieldFrame } from "@/components/form/TextField";
import { Input } from "@/components/ui/input";

interface CodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function CodeField({ value, onChange, autoFocus }: CodeFieldProps) {
  const id = useId();
  return (
    <FieldFrame id={id} label="6-digit code">
      <Input
        id={id}
        name="code"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 6))
        }
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        minLength={6}
        maxLength={6}
        required
        autoFocus={autoFocus}
        title="Enter the 6 digits from the email"
        className="tabular h-16 pl-[0.55em] text-center font-display text-3xl font-semibold tracking-[0.55em]"
      />
    </FieldFrame>
  );
}
