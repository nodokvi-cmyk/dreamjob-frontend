"use client";

import { BookmarkHeart } from "@/components/vacancies/BookmarkHeart";
import { ViewerMarksProvider, useViewerMarks } from "@/components/vacancies/ViewerMarks";
import type { VacancyDetail } from "@/types";

type DetailTarget = Pick<VacancyDetail, "id" | "title" | "companyApproved" | "myApplication" | "isBookmarked">;

export function DetailActions({ vacancy }: { vacancy: DetailTarget }) {
  return (
    <ViewerMarksProvider source={{ kind: "detail", id: vacancy.id }}>
      <DetailActionsInner vacancy={vacancy} />
    </ViewerMarksProvider>
  );
}

function DetailActionsInner({ vacancy }: { vacancy: DetailTarget }) {
  const { viewer, ready, marksFor } = useViewerMarks();
  if (viewer !== "user" || !ready) return null;
  const marks = marksFor(vacancy.id, {
    companyApproved: vacancy.companyApproved,
    myApplication: vacancy.myApplication,
    isBookmarked: vacancy.isBookmarked,
  });

  return (
    <div className="mt-6 flex items-center justify-between gap-4 border-t border-enamel-seam pt-5">
      <span className="text-[0.95rem] text-on-enamel-muted">
        {marks.isBookmarked ? "Saved to your bookmarks" : "Save it for later"}
      </span>
      <BookmarkHeart vacancyId={vacancy.id} title={vacancy.title} bookmarked={marks.isBookmarked} tone="enamel" />
    </div>
  );
}
