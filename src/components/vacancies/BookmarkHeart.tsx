"use client";

import { HeartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useViewerMarks } from "@/components/vacancies/ViewerMarks";
import { cn } from "@/lib/utils";
import { addBookmark, removeBookmark } from "@/services/bookmarks.service";

const ERROR_MS = 5000;

interface BookmarkHeartProps {
  vacancyId: string;
  title: string;
  bookmarked: boolean;
  onChange?: (bookmarked: boolean) => void;
  tone?: "surface" | "enamel";
  className?: string;
}

export function BookmarkHeart({ vacancyId, title, bookmarked, onChange, tone = "surface", className }: BookmarkHeartProps) {
  const { viewer, ready, update } = useViewerMarks();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!failed) return;
    const timer = window.setTimeout(() => setFailed(false), ERROR_MS);
    return () => window.clearTimeout(timer);
  }, [failed]);

  if (viewer !== "user" || !ready) return null;

  async function toggle() {
    if (pending) return;
    const next = !bookmarked;
    setPending(true);
    setFailed(false);
    update(vacancyId, { isBookmarked: next });
    try {
      const saved = next ? await addBookmark(vacancyId) : await removeBookmark(vacancyId);
      update(vacancyId, { isBookmarked: saved });
      onChange?.(saved);
    } catch {
      update(vacancyId, { isBookmarked: !next });
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <span className={cn("relative z-10 inline-flex items-center gap-2", className)}>
      <span role="status" className={cn("text-sm", failed ? "text-destructive" : "sr-only")}>
        {failed ? "Not saved, try again" : ""}
      </span>
      <button
        type="button"
        aria-pressed={bookmarked}
        aria-label={`Save ${title}`}
        aria-busy={pending || undefined}
        onClick={toggle}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-md border transition-[background-color,border-color,color] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-[1.05rem]",
          tone === "enamel"
            ? "border-on-enamel/35 text-on-enamel hover:border-on-enamel/60 hover:bg-enamel-raised"
            : "border-foreground/20 text-foreground hover:border-foreground/40 hover:bg-muted",
          bookmarked && "text-line-scarlet",
        )}
      >
        <HeartIcon aria-hidden className={cn(bookmarked && "fill-current")} strokeWidth={2} />
      </button>
    </span>
  );
}
