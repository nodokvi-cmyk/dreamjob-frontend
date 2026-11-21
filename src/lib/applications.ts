import { MAX_PDF_MB } from "@/lib/files";
import type {
  ApplicantSort,
  ApplicationStatus,
  CompanyApplicationStatus,
  MyApplicationSort,
  PreviousOutcome,
} from "@/types";

export const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "submitted",
  "viewed",
  "interview",
  "accepted",
  "rejected",
  "withdrawn",
];

export const COMPANY_APPLICATION_STATUSES: readonly CompanyApplicationStatus[] = [
  "viewed",
  "interview",
  "accepted",
  "rejected",
];

export const PREVIOUS_OUTCOMES: readonly PreviousOutcome[] = ["withdrawn", "rejected"];

export const MY_APPLICATION_SORTS: readonly MyApplicationSort[] = ["-date", "date"];

export const APPLICANT_SORTS: readonly ApplicantSort[] = ["-date", "date", "name", "-name", "age", "-age"];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  viewed: "Viewed",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const MESSAGE_MAX_WORDS = 100;

export const MESSAGE_MAX_CHARS = 800;

export const APPLICATION_FILE_MAX_MB = MAX_PDF_MB;

export const APPLICATION_FILE_MAX_BYTES = APPLICATION_FILE_MAX_MB * 1024 * 1024;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export const APPLICATION_FILE_LABEL = `${APPLICATION_FILE_MAX_MB} MB`;

export const MESSAGE_COUNTER_FROM = 700;

export function applicationPdfProblem(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Choose a PDF file.";
  if (file.size === 0) return "That file is empty. Choose another one.";
  if (file.size > APPLICATION_FILE_MAX_BYTES) return `Each file can be at most ${APPLICATION_FILE_LABEL}.`;
  return null;
}

export function titleQuery(title: string): string {
  return title.trim().split(/\s+/).slice(0, 5).join(" ").slice(0, 64).trim();
}

export interface SentContent {
  message: string;
  hasCv: boolean;
  hasCoverLetter: boolean;
}

export const EMPTY_CONTENT: SentContent = { message: "", hasCv: false, hasCoverLetter: false };

export function isEmptyContent(content: SentContent): boolean {
  return !content.message.trim() && !content.hasCv && !content.hasCoverLetter;
}

export interface Resubmission {
  message: string;
  newCv: boolean;
  newCoverLetter: boolean;
  keepPrevious: boolean;
}

export function repeatsPrevious(next: Resubmission, previous: SentContent | null): boolean {
  const message = next.message.trim();
  const newFiles = next.newCv || next.newCoverLetter;
  if (next.keepPrevious && !newFiles && !message) return true;
  if (!previous) return false;
  if (isEmptyContent(previous) && !newFiles && !message) return true;
  return !newFiles && message !== "" && message === previous.message.trim();
}

export const REPEAT_WARNING =
  "Sending new files or a new message is recommended, because this application was rejected earlier and you are about to send the same content again.";

export const PRIVACY_NOTE =
  "Applying shares your email and phone number with this company, even if they are private on your profile.";
