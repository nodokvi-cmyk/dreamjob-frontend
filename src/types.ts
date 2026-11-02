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

export interface ChangePasswordInput extends NewPasswordInput {
  currentPassword?: string;
}

export interface ResetPasswordInput extends NewPasswordInput {
  email: string;
  code: string;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phone?: string;
}

export interface CompanyUpdateInput {
  companyName?: string;
  description?: string;
  location?: string;
  website?: string;
  operatingCities?: string[];
  phone?: string;
  director?: DirectorInput | null;
}

export interface CvLink {
  url: string;
  expiresIn: number;
}

export type Session =
  | { accountId: string; accountRole: "user" | "admin"; account: CurrentUser }
  | { accountId: string; accountRole: "company"; account: CurrentCompany };

export type WorkMode = "remote" | "onsite" | "hybrid";

export type EmploymentType = "full-time" | "part-time" | "internship" | "temporary";

export type Currency = "GEL" | "USD" | "EUR";

export type VacancyStatus = "pending" | "published" | "rejected" | "closed" | "expired";

export type VacancySort = "-date" | "date" | "-salary" | "salary" | "deadline" | "-deadline";

export interface VacancyPhoto {
  id: string;
  url: string;
}

export interface Vacancy {
  id: string;
  title: string;
  description: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: Currency;
  requirements: string[];
  deadline: string;
  status: VacancyStatus;
  photos: VacancyPhoto[];
  company: string;
  createdAt: string;
}

export interface OwnVacancy extends Vacancy {
  rejectionReason: string;
  updatedAt: string;
}

export interface VacancyInput {
  title: string;
  description: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: Currency;
  requirements: string[];
  deadline: string;
}

export type VacancyUpdateInput = Partial<Omit<VacancyInput, "salaryMin" | "salaryMax">> & {
  salaryMin?: number | null;
  salaryMax?: number | null;
};

export interface OwnVacancyQuery {
  q?: string;
  status?: VacancyStatus;
  page?: number;
}

export interface VacancyQuery {
  q?: string;
  category?: string;
  location?: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  salaryMin?: number;
  currency?: Currency;
  sort?: VacancySort;
  page?: number;
}

export type AdminStatusFilter = VacancyStatus | "all";

export interface AdminVacancyQuery {
  q?: string;
  status: AdminStatusFilter;
  companyId?: string;
  category?: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  sort?: VacancySort;
  page?: number;
}
