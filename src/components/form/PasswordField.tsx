"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import { FieldFrame } from "@/components/form/TextField";
import { Input } from "@/components/ui/input";
import { PASSWORD_MAX, PASSWORD_RULES } from "@/lib/password";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  name?: string;
  aside?: ReactNode;
  describedBy?: string;
  autoFocus?: boolean;
}

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  name,
  aside,
  describedBy,
  autoFocus,
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <FieldFrame id={id} label={label} aside={aside}>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          autoComplete={autoComplete}
          maxLength={PASSWORD_MAX}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          autoFocus={autoFocus}
          aria-describedby={describedBy}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-offset-[-2px]"
        >
          {visible ? <EyeOffIcon aria-hidden className="size-[18px]" /> : <EyeIcon aria-hidden className="size-[18px]" />}
        </button>
      </div>
    </FieldFrame>
  );
}

interface NewPasswordFieldsProps {
  password: string;
  confirm: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  autoFocus?: boolean;
}

export function NewPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  autoFocus,
}: NewPasswordFieldsProps) {
  const rulesId = useId();
  const matchId = useId();
  const matches = confirm.length > 0 && confirm === password;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <PasswordField
          label="New password"
          value={password}
          onChange={onPasswordChange}
          autoComplete="new-password"
          describedBy={rulesId}
          autoFocus={autoFocus}
        />
        <ul id={rulesId} aria-label="Password rules" className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => (
            <RuleItem key={rule.id} met={rule.test(password)} label={rule.label} />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <PasswordField
          label="Repeat password"
          value={confirm}
          onChange={onConfirmChange}
          autoComplete="new-password"
          describedBy={matchId}
        />
        <ul id={matchId} aria-label="Password match">
          <RuleItem met={matches} label="Both passwords match" />
        </ul>
      </div>
    </div>
  );
}

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={cn("flex items-start gap-2.5 text-sm", met ? "text-foreground" : "text-muted-foreground")}>
      <span
        aria-hidden
        className={cn(
          "mt-[3px] size-3.5 shrink-0 rounded-full border-[3px] transition-colors duration-200",
          met ? "border-line-green bg-line-green" : "border-foreground/30 bg-transparent",
        )}
      />
      <span>
        {label}
        <span className="sr-only">{met ? ", done" : ", not yet"}</span>
      </span>
    </li>
  );
}
