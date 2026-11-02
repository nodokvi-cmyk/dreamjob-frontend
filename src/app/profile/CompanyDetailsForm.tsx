"use client";

import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { TextAreaField, TextField } from "@/components/form/TextField";
import { SaveRow } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { useAuth } from "@/context/AuthContext";
import { problem } from "@/lib/errors";
import { PHONE_HINT, PHONE_PATTERN, splitList } from "@/lib/form";
import { updateCompany } from "@/services/companies.service";
import type { CompanyUpdateInput, CurrentCompany } from "@/types";

const MAX_CITIES = 50;

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function CompanyDetailsForm({
  accountId,
  account,
}: {
  accountId: string;
  account: CurrentCompany;
}) {
  const { refresh } = useAuth();
  const { pending, error, notice, run, fail, succeed } = useAction();
  const [companyName, setCompanyName] = useState(account.companyName);
  const [description, setDescription] = useState(account.description);
  const [location, setLocation] = useState(account.location);
  const [website, setWebsite] = useState(account.website);
  const [cities, setCities] = useState(account.operatingCities.join(", "));
  const [phone, setPhone] = useState(account.phone);
  const [directorName, setDirectorName] = useState(account.director?.fullName ?? "");
  const [directorPhone, setDirectorPhone] = useState(account.director?.phone ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = companyName.trim();
    const about = description.trim();
    const place = location.trim();
    const site = website.trim();
    const cityList = splitList(cities);
    const number = phone.trim();
    const director = directorName.trim();
    const directorNumber = directorPhone.trim();

    if (name === "" && account.companyName !== "") return fail(problem("Enter your company name."));
    if (about === "" && account.description !== "") return fail(problem("Add a short description of your company."));
    if (site !== "" && !isWebUrl(site)) {
      return fail(problem("Enter the full website address, starting with https://"));
    }
    if (cityList.length > MAX_CITIES) return fail(problem(`List up to ${MAX_CITIES} cities.`));
    if (cityList.some((city) => city.length > 64)) {
      return fail(problem("Each city name can be up to 64 characters."));
    }
    if (director === "" && directorNumber !== "") {
      return fail(problem("Add the director's full name, or clear the director's phone."));
    }

    const input: CompanyUpdateInput = {};
    if (name !== account.companyName) input.companyName = name;
    if (about !== account.description) input.description = about;
    if (place !== account.location) input.location = place;
    if (site !== account.website) input.website = site;
    if (cityList.join("\n") !== account.operatingCities.join("\n")) input.operatingCities = cityList;
    if (number !== account.phone) input.phone = number;
    const directorChanged =
      director !== (account.director?.fullName ?? "") ||
      directorNumber !== (account.director?.phone ?? "");
    if (directorChanged) {
      input.director =
        director === ""
          ? null
          : directorNumber === ""
            ? { fullName: director }
            : { fullName: director, phone: directorNumber };
    }

    if (Object.keys(input).length === 0) return succeed("Nothing changed.");

    const wasComplete = account.isProfileComplete;
    await run(async () => {
      await updateCompany(accountId, input);
      const session = await refresh();
      setCities(cityList.join(", "));
      const complete = session.accountRole === "company" && session.account.isProfileComplete;
      if (!wasComplete && complete) return "Saved. Your company is ready for our team to review.";
      return "Details saved.";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {account.isProfileComplete ? null : (
        <FormAlert tone="attention" message="Complete your company profile">
          Add your company name and a description. Our team reviews your company once both are
          saved.
        </FormAlert>
      )}
      <TextField
        label="Company name"
        name="organization"
        autoComplete="organization"
        maxLength={128}
        required={account.companyName !== ""}
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />
      <TextAreaField
        label="Description"
        name="description"
        rows={6}
        maxLength={2000}
        required={account.description !== ""}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        hint="What your company does and what it's like to work there."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Location"
          name="location"
          autoComplete="address-level2"
          optional
          maxLength={128}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          hint="Head office city or address."
        />
        <TextField
          label="Website"
          type="url"
          name="url"
          autoComplete="url"
          inputMode="url"
          optional
          maxLength={256}
          placeholder="https://"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <TextField
        label="Operating cities"
        name="operatingCities"
        optional
        value={cities}
        onChange={(event) => setCities(event.target.value)}
        hint={`Separate cities with commas, for example Tbilisi, Batumi. Up to ${MAX_CITIES}.`}
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
        className="sm:max-w-[calc(50%-0.625rem)]"
      />
      <fieldset className="flex flex-col gap-4 rounded-[17px] border border-border p-4 sm:p-5">
        <legend className="transit-label px-1.5 text-sm">
          Director <span className="font-sans font-normal tracking-normal text-muted-foreground normal-case">Optional</span>
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            name="directorName"
            autoComplete="off"
            maxLength={128}
            value={directorName}
            onChange={(event) => setDirectorName(event.target.value)}
          />
          <TextField
            label="Phone"
            type="tel"
            name="directorPhone"
            autoComplete="off"
            inputMode="tel"
            optional
            pattern={PHONE_PATTERN}
            maxLength={20}
            title={PHONE_HINT}
            value={directorPhone}
            onChange={(event) => setDirectorPhone(event.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">Clear both fields to remove the director.</p>
      </fieldset>
      <SaveRow pending={pending} label="Save details" pendingLabel="Saving" notice={notice} error={error} />
    </form>
  );
}
