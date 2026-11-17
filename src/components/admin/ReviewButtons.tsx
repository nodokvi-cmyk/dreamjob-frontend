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
import { approvePublication, rejectPublication } from "@/services/publications.service";

export const REASON_MAX = 1000;

type ReviewKind = "vacancy" | "publication";

interface ReviewCopy {
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
  approved: string;
  rejectTitle: string;
  rejectBody: string;
  reasonLabel: string;
  reasonHint: string;
  confirm: string;
}

const COPY: Record<ReviewKind, ReviewCopy> = {
  vacancy: {
    approve: approveVacancy,
    reject: rejectVacancy,
    approved: "It is live now.",
    rejectTitle: "Reject this vacancy?",
    rejectBody: "goes back to the company with your note. They can edit it and send it for review again.",
    reasonLabel: "Reason for the company",
    reasonHint: "Shown to the company on the vacancy.",
    confirm: "Reject vacancy",
  },
  publication: {
    approve: approvePublication,
    reject: rejectPublication,
    approved: "Companies can find it now.",
    rejectTitle: "Reject this publication?",
    rejectBody: "goes back to the job seeker with your note. They can edit it and send it again, or delete it.",
    reasonLabel: "Reason for the job seeker",
    reasonHint: "Shown to the job seeker on the publication and in their notification.",
    confirm: "Reject publication",
  },
};

interface ReviewButtonsProps {
  item: { id: string; title: string };
  kind?: ReviewKind;
  size?: "sm" | "default";
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}

export function ReviewButtons({ item, kind = "vacancy", size = "sm", onDone, onStale }: ReviewButtonsProps) {
  const { pending, error, run } = useAction();
  const [reason, setReason] = useState("");
  const { title } = item;
  const copy = COPY[kind];

  async function approve() {
    let stale = false;
    const done = await run(async () => {
      try {
        await copy.approve(item.id);
      } catch (failure: unknown) {
        const message = staleMessage(failure);
        if (message === null) throw failure;
        stale = true;
        onStale(message);
      }
      return null;
    });
    if (done && !stale) onDone(`“${title}” approved. ${copy.approved}`);
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
          title={copy.rejectTitle}
          description={
            <div className="flex flex-col gap-4">
              <p>
                <span className="font-semibold text-foreground">{title}</span> {copy.rejectBody}
              </p>
              <TextAreaField
                label={copy.reasonLabel}
                optional
                hint={copy.reasonHint}
                value={reason}
                maxLength={REASON_MAX}
                rows={4}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          }
          confirmLabel={copy.confirm}
          pendingLabel="Rejecting"
          cancelLabel="Keep reviewing"
          tone="danger"
          icon={<XIcon aria-hidden />}
          onConfirm={async () => {
            const note = reason.trim();
            try {
              await copy.reject(item.id, note);
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
