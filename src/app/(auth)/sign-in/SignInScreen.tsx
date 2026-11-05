"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AccountSwitch } from "@/components/auth/AccountSwitch";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuthParams } from "@/components/auth/useAuthParams";
import { FormAlert } from "@/components/form/FormAlert";
import { PasswordField } from "@/components/form/PasswordField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { useAuth } from "@/context/AuthContext";
import { clearAuthDrafts, emailPrefill } from "@/lib/authDraft";
import { formError, type FormError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/form";
import { routes } from "@/lib/routes";
import { signInWithPassword } from "@/services/auth.service";

export function SignInScreen() {
  const { accountType, setAccountType, link } = useAuthParams();
  const { signIn } = useAuth();
  const [prefill] = useState(() => emailPrefill.read(accountType));
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const resetDone = prefill?.passwordReset ?? false;

  useEffect(() => {
    emailPrefill.dropNotice(accountType);
  }, [accountType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { token } = await signInWithPassword(accountType, normalizeEmail(email), password);
      clearAuthDrafts();
      await signIn(token);
    } catch (reason: unknown) {
      setPending(false);
      setError(
        formError(reason, {
          401: "Email or password is invalid. Check that the account type above is right too.",
        }),
      );
    }
  }

  return (
    <AuthShell
      title="Sign in"
      lead="Pick your account type, then sign in."
      footer={
        <p>
          New to GetDreamJob?{" "}
          <Link href={link(routes.signUp)} className="font-semibold text-cobalt-ink hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <AccountSwitch value={accountType} onChange={setAccountType} disabled={pending} />
        {resetDone ? (
          <FormAlert tone="success" message="Your password was reset. Sign in with the new one." />
        ) : null}
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
          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            aside={
              <Link
                href={link(routes.forgotPassword)}
                onClick={() => emailPrefill.save(normalizeEmail(email), accountType)}
                className="text-sm font-semibold text-cobalt-ink hover:underline"
              >
                Forgot password?
              </Link>
            }
          />
          {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
          <SubmitButton pending={pending} label="Sign in" pendingLabel="Signing in" />
        </form>
        <GoogleButton accountType={accountType} />
      </div>
    </AuthShell>
  );
}
