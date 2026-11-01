import { routes, withQuery } from "@/lib/routes";
import type { AccountType, Session } from "@/types";

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
  if (session.accountRole === "admin") return routes.admin;
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

export function initials(name: string): string {
  const letters = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase());
  return letters.join("") || "DJ";
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
  return [vacancies, { href: routes.profile, label: "My profile" }];
}

export function accountMenu(session: Session): NavLink[] {
  if (session.accountRole === "company") {
    return [
      { href: routes.dashboard, label: "Dashboard" },
      { href: routes.profile, label: "Company profile" },
    ];
  }
  if (session.accountRole === "admin") {
    return [
      { href: routes.admin, label: "Admin" },
      { href: routes.profile, label: "Profile" },
    ];
  }
  return [{ href: routes.profile, label: "Profile" }];
}

export function companyNotice(session: Session): string | null {
  if (session.accountRole !== "company") return null;
  if (!session.account.isProfileComplete) return "Complete your company profile";
  if (!session.account.approved) return "Awaiting admin approval";
  return null;
}

export function isActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
