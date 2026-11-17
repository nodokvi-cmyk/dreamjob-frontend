import { routes, withQuery } from "@/lib/routes";
import type { AccountType, CurrentCompany, Session } from "@/types";

export interface NavLink {
  href: string;
  label: string;
}

export const companySignUpHref = `${routes.signUp}?account=company`;

export function accountTypeFrom(value: string | null | undefined): AccountType {
  return value === "company" ? "company" : "user";
}

export function accountParam(type: AccountType): string | null {
  return type === "company" ? "company" : null;
}

export function homeFor(session: Session): string {
  if (session.accountRole === "company") return routes.dashboard;
  if (session.accountRole === "admin") return routes.adminVacancies;
  return routes.vacancies;
}

export function afterAuthPath(session: Session, next: string | null): string {
  if (session.account.passwordSetupRequired) {
    return withQuery(routes.setPassword, { next });
  }
  return next ?? homeFor(session);
}

export function displayName(session: Session): string {
  if (session.accountRole === "company") {
    return session.account.companyName || session.account.email;
  }
  const { firstName, lastName } = session.account;
  return [firstName, lastName].filter(Boolean).join(" ") || session.account.email;
}

export function roleLabel(session: Session): string {
  if (session.accountRole === "company") return "Company";
  if (session.accountRole === "admin") return "Admin";
  return "Job seeker";
}

export function primaryNav(session: Session | null): NavLink[] {
  const vacancies = { href: routes.vacancies, label: "Vacancies" };
  if (!session) return [vacancies, { href: companySignUpHref, label: "For companies" }];
  if (session.accountRole === "company") {
    return [vacancies, { href: routes.dashboard, label: "Dashboard" }];
  }
  if (session.accountRole === "admin") {
    return [vacancies, { href: routes.admin, label: "Admin" }];
  }
  return [
    vacancies,
    { href: routes.myApplications, label: "My applications" },
    { href: routes.bookmarks, label: "Bookmarks" },
    { href: routes.publications, label: "Publications" },
  ];
}

export function accountMenu(session: Session): NavLink[] {
  if (session.accountRole === "company") {
    return [
      { href: routes.dashboard, label: "Dashboard" },
      { href: routes.profile, label: "Company profile" },
      { href: routes.billing, label: "Billing" },
    ];
  }
  if (session.accountRole === "admin") {
    return [
      { href: routes.admin, label: "Admin" },
      { href: routes.profile, label: "Profile" },
    ];
  }
  return [
    { href: routes.profile, label: "Profile" },
    { href: routes.myApplications, label: "My applications" },
    { href: routes.bookmarks, label: "Bookmarks" },
    { href: routes.publications, label: "Publications" },
  ];
}

export function companyNotice(session: Session): string | null {
  if (session.accountRole !== "company") return null;
  const gap = companyGap(session.account);
  if (gap === "plan") return "Choose a plan";
  if (gap === "details") return "Complete your company profile";
  if (!session.account.approved) return "Awaiting admin approval";
  return null;
}

export function isActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export type CompanyGap = "details" | "plan";

export function companyGap(account: CurrentCompany): CompanyGap | null {
  if (account.isProfileComplete) return null;
  if (!account.companyName.trim() || !account.description.trim()) return "details";
  return account.plan ? "details" : "plan";
}

export function companyNoticeHref(session: Session): string {
  if (session.accountRole === "company" && companyGap(session.account) === "plan") return routes.billing;
  return routes.profile;
}
