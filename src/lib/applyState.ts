import type { UserVacancyStatus, VacancyStatus, ViewerMarks } from "@/types";

export type ApplyState =
  | { kind: "apply" }
  | { kind: "reapply" }
  | { kind: "applied"; label: "Applied" | "Reapplied"; reason: string }
  | { kind: "unavailable"; reason: string };

interface ApplyTarget {
  status: VacancyStatus | UserVacancyStatus;
  deadline: string;
}

const ACTIVE = new Set(["submitted", "viewed", "interview", "accepted"]);

function closedReason(vacancy: ApplyTarget, companyApproved: boolean, now: number): string | null {
  if (vacancy.status === "closed") return "This vacancy is closed.";
  if (vacancy.status === "unavailable") return "This vacancy is temporarily unavailable.";
  if (vacancy.status === "expired" || Date.parse(vacancy.deadline) <= now) return "This vacancy has expired.";
  if (vacancy.status !== "published") return "This vacancy isn't open for applications.";
  if (!companyApproved) return "This company isn't accepting applications right now.";
  return null;
}

export function applyState(vacancy: ApplyTarget, marks: ViewerMarks, now: number): ApplyState {
  const closed = closedReason(vacancy, marks.companyApproved, now);
  const application = marks.myApplication;
  if (!application) return closed ? { kind: "unavailable", reason: closed } : { kind: "apply" };
  if (application.canReapply && !closed) return { kind: "reapply" };
  const label = application.submissions >= 2 ? "Reapplied" : "Applied";
  if (ACTIVE.has(application.status)) {
    return { kind: "applied", label, reason: "You already applied. Your application is with the employer." };
  }
  if (application.submissions >= 2) {
    return { kind: "applied", label, reason: "You have used both applications for this vacancy." };
  }
  return { kind: "applied", label, reason: closed ?? "You can't apply to this vacancy again." };
}
