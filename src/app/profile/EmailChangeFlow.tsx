"use client";

import { useCallback, useState, type FormEvent } from "react";
import { JourneyLine } from "@/components/auth/JourneyTrack";
import { ResendCode } from "@/components/auth/ResendCode";
import { CodeField } from "@/components/form/CodeField";
import { FormAlert } from "@/components/form/FormAlert";
import { TextField } from "@/components/form/TextField";
import { SaveRow } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { emailChangeDraft, type EmailChangeDraft } from "@/lib/authDraft";
import { CODE_REJECTED, problem } from "@/lib/errors";
import { normalizeEmail } from "@/lib/form";
import {
  confirmCurrentEmail,
  confirmNewEmail,
  requestEmailChange,
  resendNewEmailCode,
} from "@/services/emailChange.service";
import type { AccountType } from "@/types";

const STATIONS = [
  { name: "New email", detail: "" },
  { name: "Current inbox", detail: "" },
  { name: "New inbox", detail: "" },
  { name: "Done", detail: "" },
];

interface EmailChangeFlowProps {
  accountId: string;
  accountType: AccountType;
  email: string;
  verified: boolean;
}

export function EmailChangeFlow({ accountId, accountType, email, verified }: EmailChangeFlowProps) {
  const { refresh } = useAuth();
  const { pending, error, run, fail, reset } = useAction();
  const [draft, setDraft] = useState<EmailChangeDraft | null>(() => emailChangeDraft.read(accountId));
  const [changedTo, setChangedTo] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [focusCode, setFocusCode] = useState(false);

  const target = draft?.newEmail ?? "";
  const resendCurrent = useCallback(() => requestEmailChange(accountType, target), [accountType, target]);
  const resendNew = useCallback(() => resendNewEmailCode(accountType), [accountType]);

  function advance(next: EmailChangeDraft | null) {
    if (next) emailChangeDraft.save(next);
    else emailChangeDraft.clear();
    setDraft(next);
    setCode("");
    setFocusCode(next !== null);
  }

  function startOver() {
    reset();
    setNewEmail(draft?.newEmail ?? "");
    advance(null);
    setFocusCode(false);
  }

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = normalizeEmail(newEmail);
    if (address === "") return fail(problem("Enter your new email."));
    if (address === email) return fail(problem("That's already your email. Enter a different one."));
    setChangedTo(null);
    await run(async () => {
      await requestEmailChange(accountType, address);
      advance({ accountId, newEmail: address, step: "current" });
      return null;
    });
  }

  async function handleCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (code.length !== 6) return fail(problem("Enter all 6 digits of the code."));
    const current = draft;
    await run(
      async () => {
        if (current.step === "current") {
          await confirmCurrentEmail(accountType, code);
          advance({ ...current, step: "new" });
          return null;
        }
        await confirmNewEmail(accountType, code);
        advance(null);
        setFocusCode(false);
        setNewEmail("");
        setChangedTo(current.newEmail);
        await refresh();
        return null;
      },
      { 401: CODE_REJECTED },
    );
  }

  if (!verified) {
    return (
      <FormAlert tone="info" message="Verify your email first">
        You can change your email once the current one is confirmed.
      </FormAlert>
    );
  }

  const stepIndex = changedTo ? 3 : draft?.step === "new" ? 2 : draft ? 1 : 0;

  return (
    <div className="flex flex-col gap-7">
      <JourneyLine stations={STATIONS} current={stepIndex} label="Email change steps" className="max-w-xl" />

      {changedTo ? (
        <FormAlert tone="success" message="Email updated">
          Your email is now <span className="font-semibold break-all text-foreground">{changedTo}</span>. Use it the
          next time you sign in.
        </FormAlert>
      ) : null}

      {draft ? (
        <div className="flex max-w-xl flex-col gap-6">
          <p className="text-muted-foreground">
            {draft.step === "current" ? (
              <>
                To keep your account safe, we sent a 6-digit code to your current email,{" "}
                <span className="font-semibold break-all text-foreground">{email}</span>. Enter it to continue.
              </>
            ) : (
              <>
                Now we sent a code to your new email,{" "}
                <span className="font-semibold break-all text-foreground">{draft.newEmail}</span>. Enter it to
                finish.
              </>
            )}
          </p>
          <form key={draft.step} onSubmit={handleCode} className="flex flex-col gap-5">
            <CodeField value={code} onChange={setCode} autoFocus={focusCode} />
            <SaveRow
              pending={pending}
              label={draft.step === "current" ? "Confirm code" : "Change email"}
              pendingLabel="Checking the code"
              notice={null}
              error={error}
            >
              <Button type="button" variant="link" onClick={startOver} disabled={pending} className="h-auto px-0">
                Use a different email
              </Button>
            </SaveRow>
          </form>
          <ResendCode
            key={draft.step}
            email={draft.step === "current" ? email : draft.newEmail}
            onResend={draft.step === "current" ? resendCurrent : resendNew}
          />
        </div>
      ) : (
        <form onSubmit={handleRequest} className="flex max-w-xl flex-col gap-5">
          <TextField
            label="Current email"
            type="email"
            name="username"
            autoComplete="username"
            value={email}
            readOnly
          />
          <TextField
            label="New email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            maxLength={128}
            required
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            hint="We'll send a code to your current email first, then one to the new address."
          />
          <SaveRow pending={pending} label="Send code" pendingLabel="Sending" notice={null} error={error} />
        </form>
      )}
    </div>
  );
}
