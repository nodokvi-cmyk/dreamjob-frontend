"use client";

import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { ApplyForm } from "@/components/vacancies/apply/ApplyForm";
import { useViewerMarks } from "@/components/vacancies/ViewerMarks";
import { useAuth } from "@/context/AuthContext";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications";
import { applyState } from "@/lib/applyState";
import type { VacancyDetail } from "@/types";

export const APPLY_SECTION_ID = "apply";

type ApplyTarget = Pick<
  VacancyDetail,
  "id" | "title" | "status" | "deadline" | "companyApproved" | "myApplication" | "isBookmarked"
>;

export function focusApplySection() {
  const heading = document.getElementById(`${APPLY_SECTION_ID}-title`);
  if (!heading) return;
  heading.scrollIntoView({ behavior: "smooth", block: "start" });
  heading.focus({ preventScroll: true });
}

export function ApplyPanel({ vacancy, now }: { vacancy: ApplyTarget; now: number }) {
  const { viewer, ready, marksFor } = useViewerMarks();
  const { session } = useAuth();
  const [sent, setSent] = useState(false);
  const scrolled = useRef(false);
  const visible = viewer === "user" && ready;

  useEffect(() => {
    if (!visible || scrolled.current || window.location.hash !== `#${APPLY_SECTION_ID}`) return;
    scrolled.current = true;
    focusApplySection();
  }, [visible]);

  if (!visible || session?.accountRole !== "user") return null;

  const marks = marksFor(vacancy.id, {
    companyApproved: vacancy.companyApproved,
    myApplication: vacancy.myApplication,
    isBookmarked: vacancy.isBookmarked,
  });
  const state = applyState(vacancy, marks, now);
  if (state.kind === "unavailable") return null;

  const application = marks.myApplication;
  const heading =
    state.kind === "apply" ? "Apply for this role" : state.kind === "reapply" ? "Reapply" : "Your application";

  return (
    <section
      id={APPLY_SECTION_ID}
      aria-labelledby={`${APPLY_SECTION_ID}-title`}
      className="flex scroll-mt-24 flex-col gap-6 border-t border-border pt-10"
    >
      <div className="flex flex-col gap-2">
        <h2
          id={`${APPLY_SECTION_ID}-title`}
          tabIndex={-1}
          className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase outline-none"
        >
          {heading}
        </h2>
        {state.kind === "apply" ? (
          <p className="max-w-[60ch] text-muted-foreground">
            Everything below is optional. Add what helps the employer decide.
          </p>
        ) : null}
      </div>

      {state.kind === "applied" && application ? (
        <div className="flex flex-col gap-4">
          {sent ? <FormAlert tone="success" message="Application sent. The employer can see it now." /> : null}
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="transit-label text-sm text-muted-foreground">Status</span>
            <span className="inline-flex h-7 items-center rounded-full border border-border bg-card px-3 transit-label text-[0.85rem]">
              {APPLICATION_STATUS_LABELS[application.status]}
            </span>
          </p>
          <p className="max-w-[60ch] text-muted-foreground">{state.reason}</p>
        </div>
      ) : state.kind === "apply" || state.kind === "reapply" ? (
        <ApplyForm
          vacancy={vacancy}
          kind={state.kind}
          previousStatus={application?.status ?? null}
          hasProfileCv={session.account.hasCv}
          onSent={() => setSent(true)}
        />
      ) : null}
    </section>
  );
}
