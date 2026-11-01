"use client";

import type { FormEvent } from "react";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { normalizeEmail, optional, PHONE_HINT, PHONE_PATTERN, readText, todayLocal } from "@/lib/form";
import { signUpUser } from "@/services/auth.service";
import type { SignUpFormProps } from "./SignUpScreen";

export function UserSignUpForm({ pending, alert, onSubmit, onInvalid }: SignUpFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(readText(data, "email"));
    const birthDate = readText(data, "birthDate");
    if (birthDate > todayLocal()) {
      onInvalid("Your birth date can't be in the future.");
      return;
    }
    onSubmit(email, () =>
      signUpUser({
        firstName: readText(data, "firstName"),
        lastName: readText(data, "lastName"),
        email,
        birthDate,
        phone: optional(readText(data, "phone")),
      }),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="First name" name="firstName" autoComplete="given-name" maxLength={64} required />
        <TextField label="Last name" name="lastName" autoComplete="family-name" maxLength={64} required />
      </div>
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        maxLength={128}
        required
        hint="We send your 6-digit code here."
      />
      <TextField label="Birth date" type="date" name="birthDate" autoComplete="bday" min="1900-01-01" required />
      <TextField
        label="Phone"
        type="tel"
        name="phone"
        autoComplete="tel"
        inputMode="tel"
        pattern={PHONE_PATTERN}
        title={PHONE_HINT}
        optional
        hint={PHONE_HINT}
      />
      {alert}
      <SubmitButton pending={pending} label="Send my code" pendingLabel="Sending your code" />
    </form>
  );
}
