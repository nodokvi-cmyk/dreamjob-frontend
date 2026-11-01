export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: `${PASSWORD_MIN} to ${PASSWORD_MAX} characters`,
    test: (value) => value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX,
  },
  { id: "upper", label: "An uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "A lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "digit", label: "A number", test: (value) => /\d/.test(value) },
  {
    id: "symbol",
    label: "A symbol, such as ! ? # or %",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
  {
    id: "ascii",
    label: "Only English letters, numbers and symbols",
    test: (value) => value.length > 0 && /^[\x20-\x7E]+$/.test(value),
  },
];

export function isStrongPassword(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function passwordProblem(newPassword: string, confirmPassword: string): string | null {
  if (!isStrongPassword(newPassword)) return "Your password doesn't meet every rule yet.";
  if (newPassword !== confirmPassword) return "The two passwords don't match.";
  return null;
}
