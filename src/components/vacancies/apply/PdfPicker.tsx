"use client";

import { FileTextIcon, XIcon } from "lucide-react";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { applicationPdfProblem } from "@/lib/applications";
import { PDF_ACCEPT, formatBytes } from "@/lib/files";

interface PdfPickerProps {
  label: string;
  file: File | null;
  error?: string;
  disabled?: boolean;
  onPick: (file: File | null, problem: string | null) => void;
}

export function PdfPicker({ label, file, error, disabled, onPick }: PdfPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={PDF_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const picked = event.target.files?.[0] ?? null;
          event.target.value = "";
          if (!picked) return;
          const problem = applicationPdfProblem(picked);
          onPick(problem ? null : picked, problem);
        }}
      />
      {file ? (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5">
          <FileTextIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.95rem] font-medium">{file.name}</span>
            <span className="block text-sm text-muted-foreground tabular">{formatBytes(file.size)}</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
            onClick={() => onPick(null, null)}
          >
            <XIcon aria-hidden />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-fit"
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => inputRef.current?.click()}
        >
          <FileTextIcon aria-hidden />
          {label}
        </Button>
      )}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
