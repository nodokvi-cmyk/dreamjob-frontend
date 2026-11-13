"use client";

import { ArrowRightIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { AlertDialog } from "radix-ui";
import { FormAlert } from "@/components/form/FormAlert";
import { Button } from "@/components/ui/button";
import { useApply } from "@/components/vacancies/apply/useApply";
import type { ApplyKind } from "@/components/vacancies/ApplyButton";
import { PRIVACY_NOTE, REPEAT_WARNING } from "@/lib/applications";
import type { ApplicationStatus } from "@/types";

interface ApplyConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: { id: string; title: string };
  kind: ApplyKind;
  previousStatus: ApplicationStatus | null;
  detailHref: string;
}

export function ApplyConfirm({ open, onOpenChange, vacancy, kind, previousStatus, detailHref }: ApplyConfirmProps) {
  const { pending, error, send, reset } = useApply(vacancy.id);
  const reapply = kind === "reapply";
  const afterReject = reapply && previousStatus === "rejected";

  function handleOpenChange(next: boolean) {
    if (pending) return;
    if (!next) reset();
    onOpenChange(next);
  }

  async function sendNow() {
    const done = await send(afterReject ? { keepPrevious: true } : {});
    if (done) onOpenChange(false);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-enamel/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[22px] border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgb(7_12_34/0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div aria-hidden className={reapply ? "h-1.5 shrink-0 bg-line-cobalt" : "h-1.5 shrink-0 bg-line-green"} />
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className="font-display text-2xl leading-[1.05] font-bold tracking-[-0.01em] break-words uppercase">
                {reapply ? "Reapply" : "Apply"} to {vacancy.title}?
              </AlertDialog.Title>
              <AlertDialog.Description asChild>
                <div className="flex flex-col gap-3 text-muted-foreground">
                  <p>
                    {afterReject
                      ? "Reapplying from here sends the message, CV and cover letter you sent before."
                      : "This sends your application without a CV, a cover letter or a message."}{" "}
                    You can attach a CV, a cover letter and a short message on the vacancy page.
                  </p>
                  {afterReject ? <p className="text-foreground">{REPEAT_WARNING}</p> : null}
                  {reapply ? (
                    <p>
                      {previousStatus === "rejected"
                        ? "This is a reapply after the employer rejected your application."
                        : "This is a reapply after you withdrew your application."}{" "}
                      You have no attempts left after it.
                    </p>
                  ) : null}
                </div>
              </AlertDialog.Description>
            </div>
            <p className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/60 px-3.5 py-3 text-sm">
              <ShieldAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-line-amber" />
              {PRIVACY_NOTE}
            </p>
            {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="ghost" disabled={pending} className="sm:mr-auto">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <Button asChild variant="outline">
                <Link href={`${detailHref}#apply`}>
                  Go to details
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
              <Button
                type="button"
                onClick={sendNow}
                disabled={pending}
                aria-disabled={pending}
                className={
                  reapply
                    ? "bg-cobalt-ink text-white hover:bg-[color-mix(in_oklab,var(--cobalt-ink),black_14%)] dark:text-enamel"
                    : "bg-success-ink text-white hover:bg-[color-mix(in_oklab,var(--success-ink),black_14%)] dark:text-enamel"
                }
              >
                {pending ? "Sending..." : reapply ? "Reapply anyway" : "Apply anyway"}
              </Button>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
