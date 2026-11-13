"use client";

import { ExternalLinkIcon, LockIcon, MailIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLoad } from "@/components/dashboard/useLoad";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Button } from "@/components/ui/button";
import { ListMessage, ResultsError } from "@/components/vacancies/ListStates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { formError } from "@/lib/errors";
import { openInNewTab } from "@/lib/openLink";
import { routes } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { getCvLink, getPublicUser } from "@/services/users.service";
import type { PublicUser } from "@/types";

export function PublicUserScreen({ id }: { id: string }) {
  const { status, session } = useAuth();
  const viewerKey = status === "loading" ? "loading" : (session?.accountId ?? "anonymous");
  const { state, reload } = useLoad(`${id}|${viewerKey}`, (signal) => getPublicUser(id, signal));
  const owner = session?.accountId === id;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6 md:pt-14">
      {state.status === "loading" ? (
        <ProfileSkeleton />
      ) : state.status === "failed" ? (
        state.error instanceof ApiError && (state.error.status === 404 || state.error.status === 400) ? (
          <ListMessage
            broken
            title="Profile not found"
            body="This profile doesn't exist, or the account was deleted."
            action={
              <Button asChild size="lg">
                <Link href={routes.vacancies}>Browse vacancies</Link>
              </Button>
            }
          />
        ) : (
          <ResultsError title="This profile didn't load" body={formError(state.error).message} onRetry={reload} />
        )
      ) : (
        <ProfileView user={state.data} owner={owner} />
      )}
    </div>
  );
}

function ProfileView({ user, owner }: { user: PublicUser; owner: boolean }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-7">
        <AccountPhoto src={user.avatarUrl} kind="user" alt={`${name} photo`} size="lg" fit="cover" />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.5rem)] leading-[0.95] font-bold tracking-[-0.02em] break-words uppercase">
            {name}
          </h1>
          <p className="transit-label text-sm text-muted-foreground">Job seeker</p>
        </div>
      </header>

      {owner ? (
        <p className="rounded-xl border border-border bg-card px-4 py-3.5 text-[0.95rem]">
          This is how your public profile looks to you. Others see what your{" "}
          <Link href={`${routes.profile}#privacy`} className="font-medium text-cobalt-ink underline-offset-4 hover:underline">
            privacy settings
          </Link>{" "}
          allow.
        </p>
      ) : null}

      {user.isPrivate ? (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border px-5 py-6">
          <LockIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">This profile is private</p>
            <p className="text-muted-foreground">Only the name and photo are shown.</p>
          </div>
        </div>
      ) : (
        <ProfileDetails user={user} />
      )}
    </article>
  );
}

function ProfileDetails({ user }: { user: Extract<PublicUser, { isPrivate: false }> }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contacts = [
    user.email ? { icon: MailIcon, label: "Email", value: user.email, href: `mailto:${user.email}` } : null,
    user.phone ? { icon: PhoneIcon, label: "Phone", value: user.phone, href: `tel:${user.phone}` } : null,
  ].filter((item) => item !== null);

  async function viewCv() {
    setOpening(true);
    setError(null);
    try {
      await openInNewTab(() => getCvLink(user.id));
    } catch (caught: unknown) {
      setError(formError(caught).message);
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="contact-title" className="flex flex-col gap-4">
        <h2 id="contact-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
          Contact
        </h2>
        {contacts.length > 0 ? (
          <dl className="divide-y divide-border rounded-[17px] border border-border bg-card">
            {contacts.map((contact) => (
              <div key={contact.label} className="flex items-center gap-3 px-5 py-3.5">
                <contact.icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <dt className="sr-only">{contact.label}</dt>
                <dd className="min-w-0 break-all">
                  <a href={contact.href} className="underline-offset-4 hover:underline">
                    {contact.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground">No contact details are shared on this profile.</p>
        )}
      </section>
      {user.hasCv ? (
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" className="w-fit" disabled={opening} onClick={viewCv}>
            <ExternalLinkIcon aria-hidden />
            {opening ? "Opening" : "View CV"}
            <span className="sr-only">(opens in a new tab)</span>
          </Button>
          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-7">
        <Skeleton className="size-32 rounded-[17px]" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-72 max-w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-[17px]" />
    </div>
  );
}
