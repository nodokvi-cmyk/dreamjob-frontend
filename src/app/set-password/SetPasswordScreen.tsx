"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { signUpJourney } from "@/components/auth/journeys";
import { FormAlert } from "@/components/form/FormAlert";
import { NewPasswordFields } from "@/components/form/PasswordField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { GateSpinner } from "@/components/guards/GateStates";
import { useAuth } from "@/context/AuthContext";
import { homeFor } from "@/lib/account";
import { formError, problem, type FormError } from "@/lib/errors";
import { passwordProblem } from "@/lib/password";
import { safeNext } from "@/lib/routes";
import { setCompanyPassword } from "@/services/companies.service";
import { setUserPassword } from "@/services/users.service";

export function SetPasswordScreen() {
  const { session, refresh } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);

  const done = session !== null && !session.account.passwordSetupRequired;
  const target = session ? (safeNext(params.get("next")) ?? homeFor(session)) : null;

  useEffect(() => {
    if (done && target) router.replace(target);
  }, [done, target, router]);

  if (!session || done) return <GateSpinner />;

  const company = session.accountRole === "company";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const issue = passwordProblem(password, confirm);
    if (issue) {
      setError(problem(issue));
      return;
    }
    setPending(true);
    setError(null);
    const input = { newPassword: password, confirmNewPassword: confirm };
    try {
      if (session.accountRole === "company") await setCompanyPassword(session.accountId, input);
      else await setUserPassword(session.accountId, input);
      await refresh();
    } catch (reason: unknown) {
      setPending(false);
      setError(formError(reason));
    }
  }

  return (
    <AuthShell
      title="Choose a password"
      lead="Last step. You'll sign in with your email and this password."
      journey={signUpJourney(2, company ? "company" : "user")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label="Email"
          type="email"
          name="username"
          autoComplete="username"
          value={session.account.email}
          readOnly
        />
        <NewPasswordFields
          password={password}
          confirm={confirm}
          onPasswordChange={setPassword}
          onConfirmChange={setConfirm}
          autoFocus
        />
        {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
        <SubmitButton pending={pending} label="Save password" pendingLabel="Saving" />
      </form>
    </AuthShell>
  );
}
