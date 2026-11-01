import type { Journey } from "@/components/auth/AuthShell";
import type { AccountType } from "@/types";

const SIGN_UP_STATIONS = [
  { name: "Your details", detail: "Tell us who you are. No password yet." },
  { name: "Email code", detail: "Type the 6-digit code we email you." },
  { name: "Password", detail: "Choose a password and you're in." },
];

const RESET_STATIONS = [
  { name: "Request code", detail: "Give us the email you signed up with." },
  { name: "New password", detail: "Type the code and choose a new password." },
  { name: "Sign in", detail: "Sign in with your new password." },
];

const COMPANY_NOTE =
  "Company accounts are reviewed by our team before they can publish vacancies.";

export function signUpJourney(current: number, type: AccountType): Journey {
  return {
    stations: SIGN_UP_STATIONS,
    current,
    note: type === "company" ? COMPANY_NOTE : undefined,
  };
}

export function resetJourney(current: number): Journey {
  return { stations: RESET_STATIONS, current };
}
