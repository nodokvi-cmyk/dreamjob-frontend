"use client";

import { AlertDialog } from "radix-ui";
import { useState, type ReactNode } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  icon?: ReactNode;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  trigger,
  open: openProp,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  const { pending, error, run, reset } = useAction();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;

  function setOpen(next: boolean) {
    setOpenState(next);
    onOpenChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    if (!next) reset();
  }

  async function confirm() {
    const done = await run(async () => {
      await onConfirm();
      return null;
    });
    if (done) setOpen(false);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-enamel/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[22px] border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgb(7_12_34/0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div
            aria-hidden
            className={cn("h-1.5 shrink-0", tone === "danger" ? "bg-line-scarlet" : "bg-line-amber")}
          />
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className="font-display text-2xl leading-none font-bold tracking-[-0.01em] uppercase">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description asChild>
                <div className="text-muted-foreground">{description}</div>
              </AlertDialog.Description>
            </div>
            {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  {cancelLabel}
                </Button>
              </AlertDialog.Cancel>
              <Button
                type="button"
                onClick={confirm}
                disabled={pending}
                aria-disabled={pending}
                className={cn(
                  tone === "danger" &&
                    "bg-destructive text-white hover:bg-[color-mix(in_oklab,var(--destructive),black_14%)] dark:text-enamel",
                )}
              >
                {icon}
                {pending ? pendingLabel : confirmLabel}
              </Button>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
