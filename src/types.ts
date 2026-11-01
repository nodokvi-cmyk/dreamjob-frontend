export type AuthRole = "user" | "admin" | "company";

export type UserRole = "user" | "admin";

export type AccountType = "user" | "company";

export interface TokenPayload {
  accountId: string;
  accountRole: AuthRole;
  exp: number;
}

export interface TokenResponse {
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  take: number;
}

export interface User {
  _id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  birthDate?: string;
  age?: number;
  googleId?: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isCvPublic: boolean;
  appliedVacancies: string[];
  avatarUrl: string;
  hasCv: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Director {
  fullName: string;
  phone: string;
}

export interface Company {
  _id: string;
  companyName: string;
  email: string;
  googleId?: string;
  director?: Director;
  isVerified: boolean;
  approved: boolean;
  phone: string;
  location: string;
  description: string;
  website: string;
  operatingCities: string[];
  isProfileComplete: boolean;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser extends User {
  passwordSetupRequired: boolean;
}

export interface CurrentCompany extends Company {
  passwordSetupRequired: boolean;
}

export interface UserSignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  phone?: string;
}

export interface DirectorInput {
  fullName: string;
  phone?: string;
}

export interface CompanySignUpInput {
  companyName: string;
  email: string;
  description: string;
  phone?: string;
  location?: string;
  website?: string;
  operatingCities?: string[];
  director?: DirectorInput;
}

export interface NewPasswordInput {
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetPasswordInput extends NewPasswordInput {
  email: string;
  code: string;
}

export type Session =
  | { accountId: string; accountRole: "user" | "admin"; account: CurrentUser }
  | { accountId: string; accountRole: "company"; account: CurrentCompany };
