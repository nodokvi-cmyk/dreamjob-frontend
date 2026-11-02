"use client";

import { useId, useState, type FormEvent } from "react";
import { NewPasswordFields, PasswordField } from "@/components/form/PasswordField";
import { SaveRow } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { emailPrefill } from "@/lib/authDraft";
import { problem } from "@/lib/errors";
import { passwordProblem } from "@/lib/password";
import { routes } from "@/lib/routes";
import { setCompanyPassword } from "@/services/companies.service";
import { setUserPassword } from "@/services/users.service";
import type { AccountType, ChangePasswordInput } from "@/types";

interface PasswordFormProps {
  accountId: string;
  accountType: AccountType;
  email: string;
  linkedWithGoogle: boolean;
}

export function PasswordForm({ accountId, accountType, email, linkedWithGoogle }: PasswordFormProps) {
  const { pending, error, notice, run, fail } = useAction();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [round, setRound] = useState(0);
  const { signOutTo } = useAuth();
  const forgotHintId = useId();

  function handleForgot() {
    emailPrefill.save(email, accountType);
    signOutTo(routes.forgotPassword);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!linkedWithGoogle && current === "") return fail(problem("Enter your current password."));
    const issue = passwordProblem(password, confirm);
    if (issue) return fail(problem(issue));
    const input: ChangePasswordInput = { newPassword: password, confirmNewPassword: confirm };
    if (current !== "") input.currentPassword = current;
    await run(async () => {
      if (accountType === "company") await setCompanyPassword(accountId, input);
      else await setUserPassword(accountId, input);
      setCurrent("");
      setPassword("");
      setConfirm("");
      setRound((value) => value + 1);
      return "Password updated.";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      <PasswordField
        key={`current-${round}`}
        label="Current password"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
        required={!linkedWithGoogle}
        aside={
          <Button
            type="button"
            variant="link"
            onClick={handleForgot}
            disabled={pending}
            aria-describedby={forgotHintId}
            className="h-auto px-0 text-sm"
          >
            Forgot your password?
          </Button>
        }
        hint={
          linkedWithGoogle
            ? "You can sign in with Google. If you never set a password, leave this empty."
            : undefined
        }
      />
      <p id={forgotHintId} className="-mt-3 text-sm text-muted-foreground">
        Forgot it? That link signs you out and opens the reset page with your email filled in.
      </p>
      <NewPasswordFields
        key={`new-${round}`}
        password={password}
        confirm={confirm}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
      />
      <SaveRow pending={pending} label="Update password" pendingLabel="Updating" notice={notice} error={error} />
    </form>
  );
}
