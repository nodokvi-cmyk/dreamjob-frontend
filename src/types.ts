export type AuthRole = "user" | "admin" | "company";

export type UserRole = "user" | "admin";

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

export type Session =
  | { accountId: string; accountRole: "user" | "admin"; account: CurrentUser }
  | { accountId: string; accountRole: "company"; account: CurrentCompany };
