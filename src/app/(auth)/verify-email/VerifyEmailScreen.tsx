"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { AccountSwitch } from "@/components/auth/AccountSwitch";
import { AuthShell } from "@/components/auth/AuthShell";
import { signUpJourney } from "@/components/auth/journeys";
import { ResendCode } from "@/components/auth/ResendCode";
import { useAuthParams } from "@/components/auth/useAuthParams";
import { CodeField } from "@/components/form/CodeField";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { useAuth } from "@/context/AuthContext";
import { CODE_REJECTED, formError, problem, type FormError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/form";
import { routes } from "@/lib/routes";
import { resendCode, verifyEmail } from "@/services/auth.service";

export function VerifyEmailScreen() {
  const { accountType, setAccountType, email: emailParam, flag, dropFlag, link } = useAuthParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const knownEmail = emailParam !== "";
  const address = normalizeEmail(email);

  const sendAgain = useCallback(() => resendCode(accountType, address), [accountType, address]);
  const clearResendFlag = useCallback(() => dropFlag("resend"), [dropFlag]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== 6) {
      setError(problem("Enter all 6 digits of the code."));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { token } = await verifyEmail(accountType, address, code);
      await signIn(token);
    } catch (reason: unknown) {
      setPending(false);
      setError(formError(reason, { 401: CODE_REJECTED }));
    }
  }

  return (
    <AuthShell
      title="Check your email"
      lead={
        knownEmail ? (
          <p>
            We sent a <span className="whitespace-nowrap">6-digit</span> code to <span className="font-semibold break-all text-foreground">{emailParam}</span>.{" "}
            <Link href={link(routes.signUp)} className="font-semibold text-cobalt-ink hover:underline">
              Wrong email?
            </Link>
          </p>
        ) : (
          <p>Enter the email you signed up with and the 6-digit code we sent to it.</p>
        )
      }
      journey={signUpJourney(1, accountType)}
    >
      <div className="flex flex-col gap-6">
        {knownEmail ? null : <AccountSwitch value={accountType} onChange={setAccountType} disabled={pending} />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {knownEmail ? null : (
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              maxLength={128}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
          <CodeField value={code} onChange={setCode} autoFocus={knownEmail} />
          {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
          <SubmitButton pending={pending} label="Confirm email" pendingLabel="Checking the code" />
        </form>
        <ResendCode
          email={address}
          onResend={sendAgain}
          sendOnMount={flag("resend")}
          onMountSent={clearResendFlag}
          mountNotice={`You started signing up with this email before. We sent a new code to ${address}.`}
        />
      </div>
    </AuthShell>
  );
}
