"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import { AccountSwitch } from "@/components/auth/AccountSwitch";
import { AuthShell } from "@/components/auth/AuthShell";
import { resetJourney } from "@/components/auth/journeys";
import { ResendCode } from "@/components/auth/ResendCode";
import { useAuthParams } from "@/components/auth/useAuthParams";
import { CodeField } from "@/components/form/CodeField";
import { FormAlert } from "@/components/form/FormAlert";
import { NewPasswordFields } from "@/components/form/PasswordField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { codeDraft, emailPrefill } from "@/lib/authDraft";
import { CODE_REJECTED, formError, problem, type FormError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/form";
import { passwordProblem } from "@/lib/password";
import { routes } from "@/lib/routes";
import { forgotPassword, resetPassword } from "@/services/auth.service";

export function ResetPasswordScreen() {
  const { accountType: urlAccount, setAccountType, link } = useAuthParams();
  const router = useRouter();
  const [draft] = useState(() => codeDraft.read("reset"));
  const [email, setEmail] = useState(draft?.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const knownEmail = draft !== null;
  const accountType = draft?.account ?? urlAccount;
  const address = normalizeEmail(email);

  const sendAgain = useCallback(() => forgotPassword(accountType, address), [accountType, address]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== 6) {
      setError(problem("Enter all 6 digits of the code."));
      return;
    }
    const issue = passwordProblem(password, confirm);
    if (issue) {
      setError(problem(issue));
      return;
    }
    setPending(true);
    setError(null);
    try {
      await resetPassword(accountType, {
        email: address,
        code,
        newPassword: password,
        confirmNewPassword: confirm,
      });
      codeDraft.clear();
      emailPrefill.save(address, accountType, true);
      router.push(link(routes.signIn, accountType));
    } catch (reason: unknown) {
      setPending(false);
      setError(formError(reason, { 401: CODE_REJECTED }));
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      lead={
        draft ? (
          <p>
            If an account exists for <span className="font-semibold break-all text-foreground">{draft.email}</span>, we
            sent it a <span className="whitespace-nowrap">6-digit</span> code.{" "}
            <Link
              href={link(routes.forgotPassword, accountType)}
              onClick={() => {
                codeDraft.clear();
                emailPrefill.save(draft.email, accountType);
              }}
              className="font-semibold text-cobalt-ink hover:underline"
            >
              Wrong email?
            </Link>
          </p>
        ) : (
          <p>Enter your email, the 6-digit code we sent to it, and a new password.</p>
        )
      }
      journey={resetJourney(1)}
    >
      <div className="flex flex-col gap-6">
        {knownEmail ? null : <AccountSwitch value={accountType} onChange={setAccountType} disabled={pending} />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            maxLength={128}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            readOnly={knownEmail}
            className={knownEmail ? "sr-only" : undefined}
          />
          <CodeField value={code} onChange={setCode} autoFocus={knownEmail} />
          <NewPasswordFields
            password={password}
            confirm={confirm}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
          />
          {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
          <SubmitButton pending={pending} label="Reset password" pendingLabel="Saving" />
        </form>
        <ResendCode email={address} onResend={sendAgain} />
      </div>
    </AuthShell>
  );
}
