export const routes = {
  home: "/",
  vacancies: "/vacancies",
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  setPassword: "/set-password",
  forgotPassword: "/forgot-password",
  profile: "/profile",
  dashboard: "/dashboard",
  admin: "/admin",
};

export function signInWithNext(pathname: string): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return routes.signIn;
  return `${routes.signIn}?next=${encodeURIComponent(pathname)}`;
}
