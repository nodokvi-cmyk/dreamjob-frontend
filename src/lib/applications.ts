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

export const APPLICATION_FILE_MAX_MB = 2;

export const APPLICATION_FILE_MAX_BYTES = APPLICATION_FILE_MAX_MB * 1024 * 1024;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
