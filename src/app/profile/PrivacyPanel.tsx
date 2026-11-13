"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ToggleRow } from "@/components/profile/ToggleRow";
import { useAction } from "@/components/profile/useAction";
import { useAuth } from "@/context/AuthContext";
import { userHref } from "@/lib/routes";
import { setContactVisibility, setProfileVisibility } from "@/services/users.service";
import type { CurrentUser } from "@/types";

export function PrivacyPanel({ accountId, account }: { accountId: string; account: CurrentUser }) {
  const { refresh } = useAuth();
  const profile = useAction();
  const email = useAction();
  const phone = useAction();
  const busy = profile.pending || email.pending || phone.pending;

  async function toggleProfile() {
    const next = !account.isProfilePublic;
    await profile.run(async () => {
      await setProfileVisibility(accountId, next);
      await refresh();
      return next ? "Your profile is public." : "Your profile is private.";
    });
  }

  async function toggleEmail() {
    const next = !account.isEmailPublic;
    await email.run(async () => {
      await setContactVisibility(accountId, { isEmailPublic: next });
      await refresh();
      return next ? "Your email shows on your public profile." : "Your email is hidden.";
    });
  }

  async function togglePhone() {
    const next = !account.isPhonePublic;
    await phone.run(async () => {
      await setContactVisibility(accountId, { isPhonePublic: next });
      await refresh();
      return next ? "Your phone shows on your public profile." : "Your phone is hidden.";
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <ToggleRow
        label="Public profile"
        hint="When this is off, everyone except you sees only your name and photo, and companies can't open your CV."
        checked={account.isProfilePublic}
        disabled={busy}
        onToggle={toggleProfile}
        onLabel="Public"
        offLabel="Private"
        notice={profile.notice}
        error={profile.error}
      />
      <ToggleRow
        label="Show my email"
        hint="Shows your email on your public profile. Companies you apply to always see it."
        checked={account.isEmailPublic}
        disabled={busy}
        onToggle={toggleEmail}
        onLabel="Shown"
        offLabel="Hidden"
        notice={email.notice}
        error={email.error}
      />
      <ToggleRow
        label="Show my phone"
        hint="Shows your phone number on your public profile. Companies you apply to always see it."
        checked={account.isPhonePublic}
        disabled={busy}
        onToggle={togglePhone}
        onLabel="Shown"
        offLabel="Hidden"
        notice={phone.notice}
        error={phone.error}
      />
      <Link
        href={userHref(accountId)}
        className="inline-flex w-fit items-center gap-2 font-semibold text-cobalt-ink underline-offset-4 hover:underline"
      >
        See your public profile
        <ArrowRightIcon aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
