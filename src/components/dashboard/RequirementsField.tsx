"use client";

import { ListField } from "@/components/form/ListField";
import { LIMITS } from "@/lib/vacancyForm";

interface RequirementsFieldProps {
  items: readonly string[];
  error?: string;
  onChange: (items: string[]) => void;
}

export function RequirementsField({ items, error, onChange }: RequirementsFieldProps) {
  return (
    <ListField
      items={items}
      error={error}
      onChange={onChange}
      max={LIMITS.requirements}
      maxLength={LIMITS.requirement}
      hint="One skill, qualification or duty per line. Empty lines are skipped."
      itemLabel="Requirement"
      addLabel="Add requirement"
      placeholder="For example: 2+ years with React"
    />
  );
}
