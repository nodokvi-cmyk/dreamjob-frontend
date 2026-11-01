"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextAreaField, TextField } from "@/components/form/TextField";
import { normalizeEmail, optional, PHONE_HINT, PHONE_PATTERN, readText, splitList } from "@/lib/form";
import { signUpCompany } from "@/services/auth.service";
import type { DirectorInput } from "@/types";
import type { SignUpFormProps } from "./SignUpScreen";

const MAX_CITIES = 50;
const MAX_CITY_LENGTH = 64;

export function CompanySignUpForm({ pending, alert, onSubmit, onInvalid }: SignUpFormProps) {
  const [description, setDescription] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(readText(data, "email"));
    const website = readText(data, "website");
    const cities = splitList(readText(data, "operatingCities"));
    const directorName = readText(data, "directorName");
    const directorPhone = readText(data, "directorPhone");

    if (description.trim() === "") {
      onInvalid("Add a short description of your company.");
      return;
    }
    if (website && !/^https?:\/\/\S+$/i.test(website)) {
      onInvalid("The website must start with http:// or https://.");
      return;
    }
    if (cities.length > MAX_CITIES) {
      onInvalid(`List up to ${MAX_CITIES} cities.`);
      return;
    }
    if (cities.some((city) => city.length > MAX_CITY_LENGTH)) {
      onInvalid(`Each city name can be up to ${MAX_CITY_LENGTH} characters.`);
      return;
    }
    if (directorPhone && !directorName) {
      onInvalid("Add the director's full name, or leave the director's phone empty.");
      return;
    }

    const director: DirectorInput | undefined = directorName
      ? { fullName: directorName, phone: optional(directorPhone) }
      : undefined;

    onSubmit(email, () =>
      signUpCompany({
        companyName: readText(data, "companyName"),
        email,
        description: description.trim(),
        phone: optional(readText(data, "phone")),
        location: optional(readText(data, "location")),
        website: optional(website),
        operatingCities: cities.length > 0 ? cities : undefined,
        director,
      }),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField label="Company name" name="companyName" autoComplete="organization" maxLength={128} required />
      <TextField
        label="Work email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        maxLength={128}
        required
        hint="We send your 6-digit code here. It becomes your sign-in email."
      />
      <TextAreaField
        label="About the company"
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={2000}
        required
        rows={4}
        hint="What you do and who you hire. Job seekers see this on your vacancies."
      />

      <details className="group rounded-[10px] border border-border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[10px] px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="flex flex-col gap-0.5">
            <span className="transit-label text-[0.95rem]">Contact details</span>
            <span className="text-sm text-muted-foreground">Optional. You can add these later in your profile.</span>
          </span>
          <ChevronDownIcon
            aria-hidden
            className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="flex flex-col gap-5 border-t border-border px-4 pt-4 pb-5">
          <TextField
            label="Phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            pattern={PHONE_PATTERN}
            title={PHONE_HINT}
            optional
          />
          <TextField label="Location" name="location" autoComplete="address-level2" maxLength={128} optional placeholder="Tbilisi" />
          <TextField
            label="Website"
            type="url"
            name="website"
            autoComplete="url"
            inputMode="url"
            maxLength={256}
            optional
            placeholder="https://"
          />
          <TextField
            label="Cities you hire in"
            name="operatingCities"
            optional
            placeholder="Tbilisi, Batumi, Kutaisi"
            hint={`Separate cities with commas. Up to ${MAX_CITIES}.`}
          />
          <fieldset className="flex flex-col gap-5">
            <legend className="transit-label mb-4 text-sm text-muted-foreground">Director</legend>
            <TextField label="Full name" name="directorName" autoComplete="off" maxLength={128} optional />
            <TextField
              label="Phone"
              type="tel"
              name="directorPhone"
              autoComplete="off"
              inputMode="tel"
              pattern={PHONE_PATTERN}
              title={PHONE_HINT}
              optional
            />
          </fieldset>
        </div>
      </details>

      {alert}
      <SubmitButton pending={pending} label="Send my code" pendingLabel="Sending your code" />
    </form>
  );
}
