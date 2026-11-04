"use client";

import { LogOutIcon } from "lucide-react";
import type { ReactNode } from "react";
import { JourneyLine } from "@/components/auth/JourneyTrack";
import { GateSpinner } from "@/components/guards/GateStates";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { SectionNav, type NavSection } from "@/components/profile/SectionNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { displayName, roleLabel } from "@/lib/account";
import { removeLogo, uploadLogo } from "@/services/companies.service";
import { removeAvatar, uploadAvatar } from "@/services/users.service";
import type { CurrentCompany, CurrentUser, Session } from "@/types";
import { CompanyDetailsForm } from "./CompanyDetailsForm";
import { CvPanel } from "./CvPanel";
import { DeleteAccount } from "./DeleteAccount";
import { EmailChangeFlow } from "./EmailChangeFlow";
import { PasswordForm } from "./PasswordForm";
import { PhotoPanel } from "./PhotoPanel";
import { UserDetailsForm } from "./UserDetailsForm";

const USER_SECTIONS: readonly NavSection[] = [
  { id: "details", label: "Details" },
  { id: "photo", label: "Photo" },
  { id: "cv", label: "CV" },
  { id: "email", label: "Email" },
  { id: "password", label: "Password" },
  { id: "delete", label: "Delete account" },
];

const COMPANY_SECTIONS: readonly NavSection[] = [
  { id: "details", label: "Details" },
  { id: "photo", label: "Logo" },
  { id: "email", label: "Email" },
  { id: "password", label: "Password" },
  { id: "delete", label: "Delete account" },
];

const APPROVAL_STATIONS = [
  { name: "Profile", detail: "" },
  { name: "Review", detail: "" },
  { name: "Approved", detail: "" },
];

export function ProfileScreen() {
  const { session } = useAuth();
  if (!session) return <GateSpinner />;
  if (session.accountRole === "admin") return <AdminProfile session={session} account={session.account} />;
  if (session.accountRole === "company") {
    return <CompanyProfile session={session} accountId={session.accountId} account={session.account} />;
  }
  return <UserProfile session={session} accountId={session.accountId} account={session.account} />;
}

function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-20 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14">{children}</div>;
}

function ProfileHeader({
  session,
  photo,
  photoFit,
  aside,
}: {
  session: Session;
  photo: string;
  photoFit: "cover" | "contain";
  aside?: ReactNode;
}) {
  const name = displayName(session);
  const company = session.accountRole === "company";
  return (
    <header className="flex flex-col gap-7 pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <AccountPhoto
          src={photo}
          name={name}
          alt={company ? `${name} logo` : `${name} photo`}
          size="md"
          fit={photoFit}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-display text-4xl leading-[0.92] font-bold tracking-[-0.02em] break-words uppercase sm:text-5xl">
            {name}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-muted-foreground">
            <span className="transit-label text-sm text-foreground">{roleLabel(session)}</span>
            <span aria-hidden className="size-1 rounded-full bg-foreground/30" />
            <span className="min-w-0 break-all">{session.account.email}</span>
          </p>
        </div>
      </div>
      {aside}
    </header>
  );
}

function ApprovalStatus({ account }: { account: CurrentCompany }) {
  const current = !account.isProfileComplete ? 0 : account.approved ? 2 : 1;
  const status = !account.isProfileComplete
    ? { dot: "bg-line-amber", text: "Profile incomplete" }
    : account.approved
      ? { dot: "bg-line-green", text: "Approved. You can publish vacancies." }
      : { dot: "bg-line-amber", text: "Waiting for admin approval" };
  return (
    <div className="flex w-full flex-col gap-4 rounded-[17px] border border-border bg-card p-5 lg:max-w-sm">
      <p className="flex items-center gap-2.5 text-sm font-semibold">
        <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${status.dot}`} />
        <span>
          <span className="sr-only">Approval status: </span>
          {status.text}
        </span>
      </p>
      <JourneyLine stations={APPROVAL_STATIONS} current={current} label="Company approval" />
    </div>
  );
}

function Layout({ sections, children }: { sections: readonly NavSection[]; children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-12">
      <div className="contents lg:col-span-3 lg:block">
        <SectionNav sections={sections} />
      </div>
      <div className="mt-8 flex min-w-0 flex-col gap-16 lg:col-span-8 lg:mt-0">{children}</div>
    </div>
  );
}

function UserProfile({
  session,
  accountId,
  account,
}: {
  session: Session;
  accountId: string;
  account: CurrentUser;
}) {
  return (
    <Frame>
      <ProfileHeader session={session} photo={account.avatarUrl} photoFit="cover" />
      <Layout sections={USER_SECTIONS}>
        <ProfileSection id="details" title="Details" lead="Your name, birth date and phone. Your email has its own section below.">
          <UserDetailsForm accountId={accountId} account={account} />
        </ProfileSection>
        <ProfileSection id="photo" title="Photo">
          <PhotoPanel
            kind="avatar"
            src={account.avatarUrl}
            name={displayName(session)}
            upload={(file) => uploadAvatar(accountId, file)}
            remove={() => removeAvatar(accountId)}
          />
        </ProfileSection>
        <ProfileSection id="cv" title="CV" lead="Keep one PDF on file. You decide whether approved companies can open it.">
          <CvPanel accountId={accountId} account={account} />
        </ProfileSection>
        <EmailAndPassword accountId={accountId} accountType="user" account={account} />
        <ProfileSection id="delete" title="Delete account" tone="danger">
          <DeleteAccount accountId={accountId} accountType="user" />
        </ProfileSection>
      </Layout>
    </Frame>
  );
}

function CompanyProfile({
  session,
  accountId,
  account,
}: {
  session: Session;
  accountId: string;
  account: CurrentCompany;
}) {
  return (
    <Frame>
      <ProfileHeader
        session={session}
        photo={account.logoUrl}
        photoFit="contain"
        aside={<ApprovalStatus account={account} />}
      />
      <Layout sections={COMPANY_SECTIONS}>
        <ProfileSection
          id="details"
          title="Details"
          lead="What job seekers and our review team learn about your company."
        >
          <CompanyDetailsForm accountId={accountId} account={account} />
        </ProfileSection>
        <ProfileSection id="photo" title="Logo">
          <PhotoPanel
            kind="logo"
            src={account.logoUrl}
            name={displayName(session)}
            upload={(file) => uploadLogo(accountId, file)}
            remove={() => removeLogo(accountId)}
          />
        </ProfileSection>
        <EmailAndPassword accountId={accountId} accountType="company" account={account} />
        <ProfileSection id="delete" title="Delete account" tone="danger">
          <DeleteAccount accountId={accountId} accountType="company" />
        </ProfileSection>
      </Layout>
    </Frame>
  );
}

function EmailAndPassword({
  accountId,
  accountType,
  account,
}: {
  accountId: string;
  accountType: "user" | "company";
  account: CurrentUser | CurrentCompany;
}) {
  return (
    <>
      <ProfileSection
        id="email"
        title="Email"
        lead="You sign in with this address. Changing it takes a code from both inboxes."
      >
        <EmailChangeFlow
          accountId={accountId}
          accountType={accountType}
          email={account.email}
          verified={account.isVerified}
        />
      </ProfileSection>
      <ProfileSection id="password" title="Password">
        <PasswordForm
          accountId={accountId}
          accountType={accountType}
          email={account.email}
          linkedWithGoogle={Boolean(account.googleId)}
        />
      </ProfileSection>
    </>
  );
}

function AdminProfile({ session, account }: { session: Session; account: CurrentUser }) {
  const { signOut } = useAuth();
  const rows = [
    { label: "First name", value: account.firstName },
    { label: "Last name", value: account.lastName },
    { label: "Email", value: account.email },
    { label: "Phone", value: account.phone },
    { label: "Role", value: "Admin" },
  ];
  return (
    <Frame>
      <ProfileHeader session={session} photo={account.avatarUrl} photoFit="cover" />
      <div className="max-w-2xl">
        <ProfileSection id="details" title="Details" lead="Admin accounts are managed by the GetDreamJob team and can't be edited here.">
          <dl className="divide-y divide-border rounded-[17px] border border-border bg-card">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="transit-label w-32 shrink-0 text-sm text-muted-foreground">{row.label}</dt>
                <dd className={row.value ? "min-w-0 break-all" : "text-muted-foreground"}>{row.value || "Not set"}</dd>
              </div>
            ))}
          </dl>
          <Button type="button" variant="outline" onClick={signOut} className="mt-8">
            <LogOutIcon aria-hidden />
            Sign out
          </Button>
        </ProfileSection>
      </div>
    </Frame>
  );
}
