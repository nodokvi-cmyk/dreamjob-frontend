"use client";

import { useId } from "react";
import { describedBy } from "@/components/form/TextField";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_COUNTER_FROM, MESSAGE_MAX_CHARS, MESSAGE_MAX_WORDS, countWords } from "@/lib/applications";
import { cn } from "@/lib/utils";

interface MessageFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function MessageField({ value, onChange, error, disabled }: MessageFieldProps) {
  const id = useId();
  const words = countWords(value);
  const showChars = value.length > MESSAGE_COUNTER_FROM;
  const hint = `Up to ${MESSAGE_MAX_WORDS} words.`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        Message
        <span className="font-normal text-muted-foreground">Optional</span>
      </Label>
      <Textarea
        id={id}
        value={value}
        maxLength={MESSAGE_MAX_CHARS}
        rows={6}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={[describedBy(id, hint, error), `${id}-count`].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        placeholder="A few lines on why you fit this role"
      />
      <div id={`${id}-count`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm tabular">
        <span className={cn(words > MESSAGE_MAX_WORDS ? "font-medium text-destructive" : "text-muted-foreground")}>
          {words} / {MESSAGE_MAX_WORDS} words
        </span>
        <span
          aria-hidden={!showChars}
          className={cn(
            !showChars && "invisible",
            value.length >= MESSAGE_MAX_CHARS ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          {value.length} / {MESSAGE_MAX_CHARS} characters
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <p id={`${id}-hint`} className="sr-only">
        {hint}
      </p>
    </div>
  );
}
