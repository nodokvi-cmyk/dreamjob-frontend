"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AccountSwitch } from "@/components/auth/AccountSwitch";
import { AuthShell } from "@/components/auth/AuthShell";
import { resetJourney } from "@/components/auth/journeys";
import { useAuthParams } from "@/components/auth/useAuthParams";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { formError, type FormError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/form";
import { routes } from "@/lib/routes";
import { forgotPassword } from "@/services/auth.service";

export function ForgotPasswordScreen() {
  const { accountType, setAccountType, email: emailParam, link } = useAuthParams();
  const router = useRouter();
  const [email, setEmail] = useState(emailParam);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = normalizeEmail(email);
    setPending(true);
    setError(null);
    try {
      await forgotPassword(accountType, address);
      router.push(link(routes.resetPassword, { email: address }));
    } catch (reason: unknown) {
      setPending(false);
      setError(formError(reason));
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      lead="Enter the email you signed up with. If an account exists, we'll send it a 6-digit code."
      journey={resetJourney(0)}
      footer={
        <p>
          Remembered it?{" "}
          <Link href={link(routes.signIn, { email: normalizeEmail(email) || null })} className="font-semibold text-cobalt-ink hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <AccountSwitch value={accountType} onChange={setAccountType} disabled={pending} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
          <SubmitButton pending={pending} label="Send reset code" pendingLabel="Sending" />
        </form>
      </div>
    </AuthShell>
  );
}
