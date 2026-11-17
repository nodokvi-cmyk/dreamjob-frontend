export const routes = {
  home: "/",
  vacancies: "/vacancies",
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  setPassword: "/set-password",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  googleComplete: "/google/complete",
  profile: "/profile",
  myApplications: "/applications",
  bookmarks: "/bookmarks",
  publications: "/publications",
  newPublication: "/publications/new",
  board: "/board",
  invitations: "/invitations",
  sentInvitations: "/company/invitations",
  dashboard: "/dashboard",
  billing: "/company/billing",
  companyVacancies: "/company/vacancies",
  newVacancy: "/dashboard/vacancies/new",
  admin: "/admin",
  adminVacancies: "/admin/vacancies",
  adminCompanies: "/admin/companies",
  adminUsers: "/admin/users",
  adminPublications: "/admin/publications",
};

export function vacancyHref(id: string): string {
  return `${routes.vacancies}/${encodeURIComponent(id)}`;
}

export function ownVacancyHref(id: string): string {
  return `${routes.dashboard}/vacancies/${encodeURIComponent(id)}`;
}

export function adminVacancyHref(id: string): string {
  return `${routes.adminVacancies}/${encodeURIComponent(id)}`;
}

export function editVacancyHref(id: string): string {
  return `${ownVacancyHref(id)}/edit`;
}

export function adminPublicationHref(id: string): string {
  return `${routes.adminPublications}/${encodeURIComponent(id)}`;
}

export function publicationHref(id: string): string {
  return `${routes.publications}/${encodeURIComponent(id)}`;
}

export function editPublicationHref(id: string): string {
  return `${publicationHref(id)}/edit`;
}

const AUTH_PATHS = [
  routes.signIn,
  routes.signUp,
  routes.verifyEmail,
  routes.setPassword,
  routes.forgotPassword,
  routes.resetPassword,
  routes.googleComplete,
];

const SAME_SITE_BASE = "https://same-site.invalid";

const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  if (CONTROL_CHARACTER.test(value)) return null;
  let parsed: URL;
  try {
    parsed = new URL(value, SAME_SITE_BASE);
  } catch {
    return null;
  }
  if (parsed.origin !== SAME_SITE_BASE) return null;
  if (AUTH_PATHS.includes(parsed.pathname)) return null;
  return value;
}

export function redirectTarget(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return safeNext(value) ?? routes.home;
}

export function withQuery(
  path: string,
  params: Record<string, string | null | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

export function signInWithNext(pathname: string): string {
  return withQuery(routes.signIn, { next: safeNext(pathname) });
}

export function userHref(id: string): string {
  return `/users/${encodeURIComponent(id)}`;
}

export function companyHref(id: string): string {
  return `/companies/${encodeURIComponent(id)}`;
}

export function applicantsPath(vacancyId: string): string {
  return `${ownVacancyHref(vacancyId)}/applicants`;
}
