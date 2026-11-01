"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FieldFrameProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FieldFrame({ id, label, optional, hint, aside, className, children }: FieldFrameProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {optional ? <span className="font-normal text-muted-foreground">Optional</span> : null}
        </Label>
        {aside}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  aside?: ReactNode;
}

export function TextField({ label, optional, hint, aside, className, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} optional={optional} hint={hint} aside={aside} className={className}>
      <Input id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
    </FieldFrame>
  );
}

interface TextAreaFieldProps extends Omit<ComponentProps<"textarea">, "id" | "value"> {
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  value: string;
  maxLength: number;
}

export function TextAreaField({
  label,
  optional,
  hint,
  value,
  maxLength,
  className,
  ...props
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldFrame
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      className={className}
      aside={
        <span className="tabular text-xs text-muted-foreground" aria-hidden>
          {value.length} / {maxLength}
        </span>
      }
    >
      <Textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
    </FieldFrame>
  );
}
