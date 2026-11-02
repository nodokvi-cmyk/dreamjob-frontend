"use client";

import { useState, type FormEvent } from "react";
import { TextField } from "@/components/form/TextField";
import { SaveRow } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { useAuth } from "@/context/AuthContext";
import { problem } from "@/lib/errors";
import { PHONE_HINT, PHONE_PATTERN, todayLocal } from "@/lib/form";
import { updateUser } from "@/services/users.service";
import type { CurrentUser, UserUpdateInput } from "@/types";

function dateOnly(value: string | undefined): string {
  return value ? value.slice(0, 10) : "";
}

export function UserDetailsForm({ accountId, account }: { accountId: string; account: CurrentUser }) {
  const { refresh } = useAuth();
  const { pending, error, notice, run, fail, succeed } = useAction();
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [birthDate, setBirthDate] = useState(dateOnly(account.birthDate));
  const [phone, setPhone] = useState(account.phone);
  const today = todayLocal();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    const number = phone.trim();
    const input: UserUpdateInput = {};

    if (first === "") return fail(problem("Enter your first name."));
    if (last === "" && account.lastName !== "") return fail(problem("Enter your last name."));
    if (birthDate === "" && account.birthDate) return fail(problem("Pick your birth date. It can't be removed."));
    if (birthDate > today) return fail(problem("Your birth date can't be in the future."));

    if (first !== account.firstName) input.firstName = first;
    if (last !== account.lastName) input.lastName = last;
    if (birthDate !== dateOnly(account.birthDate)) input.birthDate = birthDate;
    if (number !== account.phone) input.phone = number;

    if (Object.keys(input).length === 0) return succeed("Nothing changed.");

    await run(async () => {
      await updateUser(accountId, input);
      await refresh();
      setFirstName(first);
      setLastName(last);
      setPhone(number);
      return "Details saved.";
    });
  }

  const age = account.age;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          name="given-name"
          autoComplete="given-name"
          maxLength={64}
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <TextField
          label="Last name"
          name="family-name"
          autoComplete="family-name"
          maxLength={64}
          required={account.lastName !== ""}
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Birth date"
          type="date"
          name="bday"
          autoComplete="bday"
          max={today}
          required={Boolean(account.birthDate)}
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          aside={
            <span className="tabular text-sm text-muted-foreground">
              {age === undefined ? "Age not set" : `Age ${age}`}
            </span>
          }
          hint={age === undefined ? "Add your birth date and we'll work out your age." : undefined}
        />
        <TextField
          label="Phone"
          type="tel"
          name="tel"
          autoComplete="tel"
          inputMode="tel"
          optional
          pattern={PHONE_PATTERN}
          maxLength={20}
          title={PHONE_HINT}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          hint={`${PHONE_HINT} Leave it empty to remove it.`}
        />
      </div>
      <SaveRow pending={pending} label="Save details" pendingLabel="Saving" notice={notice} error={error} />
    </form>
  );
}
