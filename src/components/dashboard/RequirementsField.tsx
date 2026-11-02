"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LIMITS, cleanRequirements } from "@/lib/vacancyForm";

interface RequirementsFieldProps {
  items: readonly string[];
  error?: string;
  onChange: (items: string[]) => void;
}

const NEAR_LIMIT = LIMITS.requirement - 40;

export function RequirementsField({ items, error, onChange }: RequirementsFieldProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const filled = cleanRequirements(items).length;
  const full = items.length >= LIMITS.requirements;

  function focusRow(index: number) {
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLInputElement>("input")[index]?.focus();
    });
  }

  function add() {
    if (full) return;
    onChange([...items, ""]);
    focusRow(items.length);
  }

  function remove(index: number) {
    const next = items.filter((_, position) => position !== index);
    onChange(next.length > 0 ? next : [""]);
    focusRow(Math.max(0, Math.min(index, next.length - 1)));
  }

  function edit(index: number, value: string) {
    onChange(items.map((item, position) => (position === index ? value : item)));
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (index === items.length - 1 && items[index].trim() !== "") add();
    else focusRow(index + 1);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          One skill, qualification or duty per line. Empty lines are skipped.
        </p>
        <span className="shrink-0 text-xs text-muted-foreground tabular">
          {filled} / {LIMITS.requirements}
        </span>
      </div>
      <ol ref={listRef} className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full border-[3px] border-foreground/60" />
              <Input
                value={item}
                maxLength={LIMITS.requirement}
                onChange={(event) => edit(index, event.target.value)}
                onKeyDown={(event) => handleKey(event, index)}
                aria-label={`Requirement ${index + 1}`}
                aria-invalid={error && item.trim().length > LIMITS.requirement ? true : undefined}
                placeholder={index === 0 ? "For example: 2+ years with React" : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={items.length === 1 && item === ""}
                aria-label={`Remove requirement ${index + 1}`}
                className="shrink-0 text-muted-foreground"
              >
                <XIcon aria-hidden />
              </Button>
            </div>
            {item.length >= NEAR_LIMIT ? (
              <span
                className={cn(
                  "pl-[1.125rem] text-xs tabular",
                  item.length >= LIMITS.requirement ? "font-medium text-destructive" : "text-muted-foreground",
                )}
              >
                {item.length} / {LIMITS.requirement} characters
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button type="button" variant="outline" size="sm" onClick={add} disabled={full} className="w-fit">
        <PlusIcon aria-hidden />
        {full ? `Limit of ${LIMITS.requirements} reached` : "Add requirement"}
      </Button>
    </div>
  );
}
