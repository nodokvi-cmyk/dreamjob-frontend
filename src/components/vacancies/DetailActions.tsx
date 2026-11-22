"use client";

import { ApplyButton } from "@/components/vacancies/ApplyButton";
import { focusApplySection } from "@/components/vacancies/apply/ApplyPanel";
import { BookmarkButton } from "@/components/vacancies/BookmarkButton";
import { useViewerMarks } from "@/components/vacancies/ViewerMarks";
import { vacancyHref } from "@/lib/routes";
import type { VacancyDetail } from "@/types";

type DetailTarget = Pick<
  VacancyDetail,
  "id" | "title" | "status" | "deadline" | "companyApproved" | "myApplication" | "isBookmarked"
>;

export function DetailActions({ vacancy, now }: { vacancy: DetailTarget; now: number }) {
  const { viewer, marksFor } = useViewerMarks();
  if (viewer === "other") return null;
  const marks = marksFor(vacancy.id, {
    companyApproved: vacancy.companyApproved,
    myApplication: vacancy.myApplication,
    isBookmarked: vacancy.isBookmarked,
  });

  return (
    <div className="mt-6 border-t border-enamel-seam pt-5">
      <div className="flex items-center gap-2.5">
        <ApplyButton
          vacancy={vacancy}
          marks={marks}
          now={now}
          detailHref={vacancyHref(vacancy.id)}
          onApply={focusApplySection}
          size="default"
          className="flex-1"
        />
        <BookmarkButton vacancyId={vacancy.id} title={vacancy.title} bookmarked={marks.isBookmarked} tone="enamel" />
      </div>
    </div>
  );
}
