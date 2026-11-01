"use client";

import { BriefcaseBusinessIcon, UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types";

const OPTIONS: { value: AccountType; label: string; Icon: typeof UserRoundIcon }[] = [
  { value: "user", label: "Job seeker", Icon: UserRoundIcon },
  { value: "company", label: "Company", Icon: BriefcaseBusinessIcon },
];

interface AccountSwitchProps {
  value: AccountType;
  onChange: (value: AccountType) => void;
  disabled?: boolean;
}

export function AccountSwitch({ value, onChange, disabled }: AccountSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Account type"
      className="grid grid-cols-2 gap-1 rounded-xl border-2 border-foreground bg-card p-1"
    >
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "transit-label flex h-10 items-center justify-center gap-2 rounded-[10px] text-[0.95rem] transition-colors duration-150 disabled:opacity-60",
              selected
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
