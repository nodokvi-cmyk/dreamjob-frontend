import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { Button } from "@/components/ui/button";
import type { FormError } from "@/lib/errors";

interface SaveRowProps {
  pending: boolean;
  label: string;
  pendingLabel: string;
  notice: string | null;
  error: FormError | null;
  children?: ReactNode;
}

export function SaveRow({ pending, label, pendingLabel, notice, error, children }: SaveRowProps) {
  return (
    <div className="flex flex-col gap-4">
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <Button type="submit" disabled={pending} aria-disabled={pending} className="w-full sm:w-auto">
          {pending ? pendingLabel : label}
        </Button>
        {children}
        <Notice message={notice} />
      </div>
    </div>
  );
}

export function Notice({ message }: { message: string | null }) {
  return (
    <p aria-live="polite" className="flex min-h-5 items-center gap-2 text-sm font-semibold text-success-ink">
      {message ? (
        <>
          <span
            aria-hidden
            className="grid size-5 shrink-0 place-items-center rounded-full bg-line-green text-white"
          >
            <CheckIcon className="size-3.5" strokeWidth={3} />
          </span>
          {message}
        </>
      ) : null}
    </p>
  );
}
