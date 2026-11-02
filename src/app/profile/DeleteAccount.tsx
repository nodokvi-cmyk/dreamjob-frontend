"use client";

import { Trash2Icon } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { TextField } from "@/components/form/TextField";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { clearAuthDrafts } from "@/lib/authDraft";
import { deleteCompany } from "@/services/companies.service";
import { deleteUser } from "@/services/users.service";
import type { AccountType } from "@/types";

const CONFIRM_WORD = "DELETE";

export function DeleteAccount({ accountId, accountType }: { accountId: string; accountType: AccountType }) {
  const { signOut } = useAuth();
  const { pending, error, run, reset } = useAction();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const company = accountType === "company";
  const confirmed = typed.trim() === CONFIRM_WORD;

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    if (!next) {
      setTyped("");
      reset();
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed) return;
    await run(async () => {
      if (company) await deleteCompany(accountId);
      else await deleteUser(accountId);
      clearAuthDrafts();
      signOut();
      return null;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex max-w-[62ch] list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
        <li>Your profile, {company ? "logo" : "photo, CV"} and sign-in are removed for good.</li>
        {company ? <li>All your vacancies and their photos are deleted too.</li> : null}
        <li>You can sign up again later with the same email, but nothing comes back.</li>
      </ul>
      <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
        <AlertDialog.Trigger asChild>
          <Button type="button" variant="destructive" className="w-full sm:w-fit">
            <Trash2Icon aria-hidden />
            Delete account
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-enamel/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[22px] border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgb(7_12_34/0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
            <div className="h-1.5 shrink-0 bg-line-scarlet" aria-hidden />
            <form onSubmit={handleConfirm} className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <AlertDialog.Title className="font-display text-2xl leading-none font-bold tracking-[-0.01em] uppercase">
                  Delete your account?
                </AlertDialog.Title>
                <AlertDialog.Description className="text-muted-foreground">
                  {company
                    ? "This deletes your company profile, logo, every vacancy you posted and their photos. It can't be undone."
                    : "This deletes your profile, photo and CV. It can't be undone."}
                </AlertDialog.Description>
              </div>
              <TextField
                label={`Type ${CONFIRM_WORD} to confirm`}
                name="confirm"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                disabled={pending}
                className="[&_input]:font-display [&_input]:text-lg [&_input]:tracking-[0.12em] [&_input]:uppercase"
              />
              {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AlertDialog.Cancel asChild>
                  <Button type="button" variant="outline" disabled={pending}>
                    Keep my account
                  </Button>
                </AlertDialog.Cancel>
                <Button
                  type="submit"
                  disabled={!confirmed || pending}
                  aria-disabled={!confirmed || pending}
                  className="bg-destructive text-white hover:bg-[color-mix(in_oklab,var(--destructive),black_14%)] dark:text-enamel"
                >
                  <Trash2Icon aria-hidden />
                  {pending ? "Deleting" : "Delete for good"}
                </Button>
              </div>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
