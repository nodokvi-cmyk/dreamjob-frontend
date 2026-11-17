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
  isProfilePublic: boolean;
  isEmailPublic: boolean;
  isPhonePublic: boolean;
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
  plan?: BillingPlan;
  credits: number;
  purchasedCredits: number;
  planRenewsAt?: string;
  planEndsAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BillingPlan = "payAsYouPublish" | "plus" | "elite";

export type PaidPlan = Exclude<BillingPlan, "payAsYouPublish">;

export interface PublicCompany {
  id: string;
  companyName: string;
  description: string;
  website: string;
  location: string;
  operatingCities: string[];
  logoUrl: string;
  email: string;
  phone: string;
  director: Director | null;
}

interface PublicUserBase {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export type PublicUser =
  | (PublicUserBase & { isPrivate: true })
  | (PublicUserBase & { isPrivate: false; hasCv: boolean; email?: string; phone?: string });

export interface ContactVisibilityInput {
  isEmailPublic?: boolean;
  isPhonePublic?: boolean;
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

export type VacancyStatus = "notSubmitted" | "pending" | "published" | "rejected" | "closed" | "expired";

export type AdminVacancyStatus = Exclude<VacancyStatus, "notSubmitted">;

export type UserVacancyStatus = "published" | "expired" | "closed" | "unavailable";

export type VacancySort = "-date" | "date" | "-salary" | "salary" | "deadline" | "-deadline";

export interface VacancyPhoto {
  id: string;
  url: string;
}

export type ApplicationStatus = "submitted" | "viewed" | "interview" | "accepted" | "rejected" | "withdrawn";

export type CompanyApplicationStatus = "viewed" | "interview" | "accepted" | "rejected";

export type PreviousOutcome = "withdrawn" | "rejected";

export interface MyApplicationMark {
  id: string;
  status: ApplicationStatus;
  canReapply: boolean;
  submissions: number;
}

export interface VacancyBase {
  id: string;
  title: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: Currency;
  deadline: string;
  company: string;
  createdAt: string;
}

export interface CompanyDisplay {
  companyName: string;
  logoUrl: string;
}

export interface ViewerMarks {
  companyApproved: boolean;
  myApplication: MyApplicationMark | null;
  isBookmarked: boolean;
}

export interface PrivateVacancyFields {
  rejectionReason: string;
  submittedAt?: string;
  firstPublishedAt?: string;
  freeWindowEndsAt?: string;
  updatedAt: string;
}

export interface VacancyCardFields extends VacancyBase {
  excerpt: string;
}

export interface VacancyCard extends VacancyCardFields, CompanyDisplay, ViewerMarks {
  status: UserVacancyStatus;
}

export interface OwnVacancyCard extends VacancyCardFields, PrivateVacancyFields {
  status: VacancyStatus;
  photos: VacancyPhoto[];
}

export interface AdminVacancyCard extends VacancyCardFields, PrivateVacancyFields, CompanyDisplay {
  status: AdminVacancyStatus;
  companyApproved: boolean;
}

export interface Vacancy extends VacancyBase {
  description: string;
  requirements: string[];
  status: VacancyStatus;
  photos: VacancyPhoto[];
}

export interface OwnVacancy extends Vacancy, PrivateVacancyFields {}

export interface VacancyDetail extends Vacancy, CompanyDisplay, ViewerMarks {}

export interface AdminVacancy extends OwnVacancy, CompanyDisplay {
  companyApproved: boolean;
}

export type BillingResult =
  | { status: "done"; vacancy: OwnVacancy }
  | { status: "paymentRequired"; checkoutUrl: string };

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

export type AdminStatusFilter = AdminVacancyStatus | "all";

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

export interface Application {
  id: string;
  vacancy: string;
  status: ApplicationStatus;
  message: string;
  hasCv: boolean;
  hasCoverLetter: boolean;
  submissions: number;
  locked: boolean;
  viaInvitation: boolean;
  previousOutcome: PreviousOutcome | null;
  appliedAt: string;
  firstAppliedAt: string;
}

export interface ApplicationVacancy extends CompanyDisplay {
  id: string;
  title: string;
  company: string;
  deadline: string;
  status: UserVacancyStatus;
}

export interface MyApplication extends Omit<Application, "vacancy"> {
  vacancy: ApplicationVacancy;
  companyApproved: boolean;
  canReapply: boolean;
}

export interface ApplyInput {
  message?: string;
  useProfileCv?: boolean;
  cv?: File;
  coverLetter?: File;
  keepPrevious?: boolean;
}

export type MyApplicationSort = "-date" | "date";

export interface MyApplicationsQuery {
  q?: string;
  status?: ApplicationStatus;
  sort?: MyApplicationSort;
  page?: number;
  focus?: string;
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  email: string;
  phone: string;
  age: number | null;
}

export interface VisibleApplicantItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  firstAppliedAt: string;
  hidden: false;
  isReapply: boolean;
  viaInvitation: boolean;
  previousOutcome: PreviousOutcome | null;
  message: string;
  hasCv: boolean;
  hasCoverLetter: boolean;
  applicant: Applicant;
}

export interface HiddenApplicantItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  hidden: true;
}

export type ApplicantItem = VisibleApplicantItem | HiddenApplicantItem;

export type ApplicantSort = "-date" | "date" | "name" | "-name" | "age" | "-age";

export interface ApplicantsQuery {
  q?: string;
  status?: ApplicationStatus;
  sort?: ApplicantSort;
  page?: number;
  focus?: string;
}

export interface ApplicationStatusChange {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface Bookmark {
  id: string;
  createdAt: string;
  vacancy: VacancyCard;
}

export type NotificationType =
  | "newApplication"
  | "applicationWithdrawn"
  | "vacancyApproved"
  | "vacancyRejected"
  | "companyApproved"
  | "companyRevoked"
  | "planEnded"
  | "planPaymentActionRequired"
  | "applicationStatusChanged"
  | "applicantCompanyRevoked"
  | "publicationApproved"
  | "publicationRejected"
  | "invitationReceived"
  | "invitationAccepted"
  | "invitationDeclined";

export interface NotificationData {
  vacancyTitle?: string;
  companyName?: string;
  status?: ApplicationStatus;
  reason?: string;
  planName?: string;
  isReapply?: boolean;
  publicationTitle?: string;
  alreadyApplied?: boolean;
}

export interface NotificationTarget {
  vacancyId: string | null;
  applicationId: string | null;
  publicationId: string | null;
  invitationId: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  data: NotificationData;
  target: NotificationTarget;
  locked: boolean;
  expiresAt: string | null;
  lockedAt: string | null;
  daysLeft: number;
  hoursLeft: number | null;
}

export interface NotificationPage extends Paginated<AppNotification> {
  unreadCount: number;
}

export interface CheckoutLink {
  url: string;
}

export type PaymentPurpose = "submit" | "extend";

export type PaymentConfirmation =
  | {
      kind: "subscription";
      paid: boolean;
      plan?: BillingPlan;
      credits: number;
      purchasedCredits: number;
      planRenewsAt?: string;
      planEndsAtPeriodEnd: boolean;
    }
  | {
      kind: "vacancy";
      paid: boolean;
      vacancyId?: string;
      purpose?: PaymentPurpose;
      vacancyStatus?: VacancyStatus;
      deadline?: string;
      credits: number;
      purchasedCredits: number;
    };

export type PublicationStatus = "pending" | "published" | "rejected" | "closed" | "expired";

export type PublicationSort = "-date" | "date";

export interface Publication {
  id: string;
  user: string;
  title: string;
  about: string;
  category: string;
  employmentTypes: EmploymentType[];
  workModes: WorkMode[];
  locations: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: Currency;
  skills: string[];
  experienceYears: number | null;
  acceptingInvites: boolean;
  hasCv: boolean;
  hasCoverLetter: boolean;
  status: PublicationStatus;
  expiresAt: string | null;
  createdAt: string;
  rejectionReason: string;
  timerPaused: boolean;
  updatedAt: string;
}

export interface PublicationInput {
  title: string;
  about: string;
  category: string;
  employmentTypes: EmploymentType[];
  workModes: WorkMode[];
  locations: string[];
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency: Currency;
  experienceYears?: number;
}

export type PublicationUpdateInput = Partial<
  Omit<PublicationInput, "salaryMin" | "salaryMax" | "experienceYears">
> & {
  salaryMin?: number | null;
  salaryMax?: number | null;
  experienceYears?: number | null;
};

export interface AdminPublicationsQuery {
  status: PublicationStatus | "all";
  userId?: string;
  sort?: PublicationSort;
  page: number;
}

export interface MyPublicationsQuery {
  status?: PublicationStatus;
  page: number;
}

export type InvitationState = "none" | "invited" | "accepted" | "declined";

export interface PublicationAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface PublicationCard {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  employmentTypes: EmploymentType[];
  workModes: WorkMode[];
  locations: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: Currency;
  skills: string[];
  experienceYears: number | null;
  hasCv: boolean;
  hasCoverLetter: boolean;
  expiresAt: string | null;
  createdAt: string;
  author: PublicationAuthor | null;
  invitation: InvitationState;
}

export interface CompanyPublication extends Omit<Publication, "rejectionReason" | "timerPaused" | "updatedAt"> {
  author: PublicationAuthor | null;
  invitation: InvitationState;
  invitationId: string | null;
  invitedVacancyId: string | null;
}

export type BoardSort = "-date" | "date" | "salary" | "-salary" | "experience" | "-experience";

export interface BoardQuery {
  q?: string;
  category?: string;
  location?: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  sort?: BoardSort;
  page: number;
}
