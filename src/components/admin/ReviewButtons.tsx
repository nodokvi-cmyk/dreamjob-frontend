"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { staleMessage } from "@/components/admin/staleError";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { FormAlert } from "@/components/form/FormAlert";
import { TextAreaField } from "@/components/form/TextField";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { approveVacancy, rejectVacancy } from "@/services/admin.service";
import type { OwnVacancy } from "@/types";

export const REASON_MAX = 500;

interface ReviewButtonsProps {
  vacancy: Pick<OwnVacancy, "id" | "title">;
  size?: "sm" | "default";
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}

export function ReviewButtons({ vacancy, size = "sm", onDone, onStale }: ReviewButtonsProps) {
  const { pending, error, run } = useAction();
  const [reason, setReason] = useState("");
  const { title } = vacancy;

  async function approve() {
    let stale = false;
    const done = await run(async () => {
      try {
        await approveVacancy(vacancy.id);
      } catch (failure: unknown) {
        const message = staleMessage(failure);
        if (message === null) throw failure;
        stale = true;
        onStale(message);
      }
      return null;
    });
    if (done && !stale) onDone(`“${title}” approved. It is live now.`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size={size}
          onClick={approve}
          disabled={pending}
          aria-label={`Approve ${title}`}
        >
          <CheckIcon aria-hidden />
          {pending ? "Approving" : "Approve"}
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              variant="outline"
              size={size}
              disabled={pending}
              aria-label={`Reject ${title}`}
            >
              <XIcon aria-hidden />
              Reject
            </Button>
          }
          onOpenChange={(open) => {
            if (!open) setReason("");
          }}
          title="Reject this vacancy?"
          description={
            <div className="flex flex-col gap-4">
              <p>
                <span className="font-semibold text-foreground">{title}</span> goes back to the
                company with your note. They can edit it and send it for review again.
              </p>
              <TextAreaField
                label="Reason for the company"
                optional
                hint="Shown to the company on the vacancy."
                value={reason}
                maxLength={REASON_MAX}
                rows={4}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          }
          confirmLabel="Reject vacancy"
          pendingLabel="Rejecting"
          cancelLabel="Keep reviewing"
          tone="danger"
          icon={<XIcon aria-hidden />}
          onConfirm={async () => {
            const note = reason.trim();
            try {
              await rejectVacancy(vacancy.id, note);
            } catch (failure: unknown) {
              const message = staleMessage(failure);
              if (message === null) throw failure;
              onStale(message);
              return;
            }
            onDone(
              note ? `“${title}” rejected, with your note.` : `“${title}” rejected, with no note.`,
            );
          }}
        />
      </div>
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
