"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AccountSwitch } from "@/components/auth/AccountSwitch";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { signUpJourney } from "@/components/auth/journeys";
import { useAuthParams } from "@/components/auth/useAuthParams";
import { FormAlert } from "@/components/form/FormAlert";
import { codeDraft, emailPrefill } from "@/lib/authDraft";
import { formError, problem, type FormError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { CompanySignUpForm } from "./CompanySignUpForm";
import { UserSignUpForm } from "./UserSignUpForm";

export interface SignUpFormProps {
  pending: boolean;
  alert: ReactNode;
  onSubmit: (email: string, send: () => Promise<unknown>) => void;
  onInvalid: (message: string) => void;
}

export function SignUpScreen() {
  const { accountType, setAccountType, link } = useAuthParams();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [takenEmail, setTakenEmail] = useState<string | null>(null);
  const company = accountType === "company";

  async function handleSubmit(email: string, send: () => Promise<unknown>) {
    setPending(true);
    setError(null);
    setTakenEmail(null);
    try {
      await send();
      codeDraft.save({ flow: "verify", email, account: accountType, resend: false });
      router.push(link(routes.verifyEmail));
    } catch (reason: unknown) {
      if (reason instanceof ApiError && reason.status === 409) {
        if (reason.code === "EMAIL_NOT_VERIFIED") {
          codeDraft.save({ flow: "verify", email, account: accountType, resend: true });
          router.push(link(routes.verifyEmail));
          return;
        }
        setTakenEmail(email);
        setError(problem("This email is already in use."));
      } else {
        setError(formError(reason));
      }
      setPending(false);
    }
  }

  function handleInvalid(message: string) {
    setTakenEmail(null);
    setError(problem(message));
  }

  function handleSwitch(type: typeof accountType) {
    setError(null);
    setTakenEmail(null);
    setAccountType(type);
  }

  const alert = error ? (
    <FormAlert tone="error" message={error.message} details={error.details}>
      {takenEmail ? (
        <p>
          It may belong to an existing account.{" "}
          <Link
            href={link(routes.signIn)}
            onClick={() => emailPrefill.save(takenEmail, accountType)}
            className="font-semibold text-cobalt-ink hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      ) : null}
    </FormAlert>
  ) : null;

  const formProps: SignUpFormProps = {
    pending,
    alert,
    onSubmit: (email, send) => void handleSubmit(email, send),
    onInvalid: handleInvalid,
  };

  return (
    <AuthShell
      title={company ? "Register your company" : "Create an account"}
      lead={
        company
          ? "Tell us about your company. After you confirm your email and set a password, our team reviews your account."
          : "We'll email you a 6-digit code. You choose a password after that."
      }
      journey={signUpJourney(0, accountType)}
      footer={
        <p>
          Already have an account?{" "}
          <Link href={link(routes.signIn)} className="font-semibold text-cobalt-ink hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <AccountSwitch value={accountType} onChange={handleSwitch} disabled={pending} />
        {company ? <CompanySignUpForm {...formProps} /> : <UserSignUpForm {...formProps} />}
        <GoogleButton accountType={accountType} />
      </div>
    </AuthShell>
  );
}
