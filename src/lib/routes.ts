export const routes = {
  home: "/",
  vacancies: "/vacancies",
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  setPassword: "/set-password",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  profile: "/profile",
  dashboard: "/dashboard",
  newVacancy: "/dashboard/vacancies/new",
  admin: "/admin",
};

export function ownVacancyHref(id: string): string {
  return `${routes.dashboard}/vacancies/${encodeURIComponent(id)}`;
}

export function editVacancyHref(id: string): string {
  return `${ownVacancyHref(id)}/edit`;
}

const AUTH_PATHS = [
  routes.signIn,
  routes.signUp,
  routes.verifyEmail,
  routes.setPassword,
  routes.forgotPassword,
  routes.resetPassword,
];

export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  const path = value.split(/[?#]/)[0];
  if (AUTH_PATHS.includes(path)) return null;
  return value;
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
