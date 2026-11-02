"use client";

import { CheckIcon, ImagePlusIcon, RotateCcwIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { Button } from "@/components/ui/button";
import { VacancyPhoto } from "@/components/vacancies/VacancyPhoto";
import { countsTowardCap, type PhotoItem } from "@/components/dashboard/usePhotoItems";
import { IMAGE_ACCEPT, MAX_UPLOAD_LABEL } from "@/lib/files";
import { cn } from "@/lib/utils";
import { LIMITS } from "@/lib/vacancyForm";

interface PhotoFieldProps {
  items: readonly PhotoItem[];
  locked: boolean;
  onAdd: (files: File[]) => string[];
  onDiscard: (key: string) => void;
  onToggleRemove: (key: string) => void;
}

export function PhotoField({ items, locked, onAdd, onDiscard, onToggleRemove }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const used = items.filter(countsTowardCap).length;
  const room = LIMITS.photos - used;

  function handleChoose(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setProblems(onAdd(files));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          JPEG, PNG or WebP, up to {MAX_UPLOAD_LABEL} each. The first photo leads the gallery.
        </p>
        <span className="shrink-0 text-xs text-muted-foreground tabular">
          {used} / {LIMITS.photos}
        </span>
      </div>
      <ul className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {items.map((item, index) => (
          <li key={item.key}>
            <PhotoTile
              item={item}
              number={index + 1}
              locked={locked}
              onDiscard={() => onDiscard(item.key)}
              onToggleRemove={() => onToggleRemove(item.key)}
            />
          </li>
        ))}
        {room > 0 && !locked ? (
          <li className={cn(items.length === 0 && "col-span-3")}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-card text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:text-foreground focus-visible:border-ring",
                items.length === 0 ? "h-36" : "aspect-[4/3]",
              )}
            >
              <ImagePlusIcon aria-hidden className="size-6" />
              <span className="transit-label text-[0.8rem]">
                {items.length === 0 ? "Add photos" : "Add photo"}
              </span>
              {items.length === 0 ? (
                <span className="text-sm">Up to {LIMITS.photos}, optional</span>
              ) : null}
            </button>
          </li>
        ) : null}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        onChange={handleChoose}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      {problems.length > 0 ? (
        <FormAlert
          tone="error"
          message={problems.length === 1 ? "One file wasn't added." : "Some files weren't added."}
          details={problems}
        />
      ) : null}
    </div>
  );
}

function Chip({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "done" | "failed" }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-[0.72rem] leading-none font-semibold",
        tone === "failed" ? "bg-destructive text-white dark:text-enamel" : "bg-enamel/85 text-on-enamel",
      )}
    >
      {tone === "done" ? <CheckIcon aria-hidden className="size-3 text-line-green" strokeWidth={3} /> : null}
      {tone === "failed" ? <TriangleAlertIcon aria-hidden className="size-3" /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

function PhotoTile({
  item,
  number,
  locked,
  onDiscard,
  onToggleRemove,
}: {
  item: PhotoItem;
  number: number;
  locked: boolean;
  onDiscard: () => void;
  onToggleRemove: () => void;
}) {
  const removed = item.kind === "saved" && item.remove;
  const failed = item.kind === "new" && item.state === "failed";
  const uploading = item.kind === "new" && item.state === "uploading";
  const percent = item.kind === "new" ? Math.round(item.progress * 100) : 0;

  let status: ReactNode = null;
  if (item.kind === "saved") {
    status = removed ? <Chip>Removed on save</Chip> : null;
  } else if (item.state === "uploading") {
    status = <Chip>{percent}%</Chip>;
  } else if (item.state === "done") {
    status = <Chip tone="done">Uploaded</Chip>;
  } else if (item.state === "failed") {
    status = <Chip tone="failed">Failed</Chip>;
  } else if (locked) {
    status = <Chip>Waiting</Chip>;
  } else {
    status = <Chip>New</Chip>;
  }

  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted",
        failed ? "border-destructive ring-2 ring-destructive/30" : "border-border",
      )}
    >
      <VacancyPhoto
        src={item.url}
        alt={`Photo ${number}`}
        width={400}
        height={300}
        priority
        className={cn("transition-[filter,opacity] duration-200", removed && "opacity-40 grayscale")}
      />
      <span className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)]">{status}</span>
      {uploading ? (
        <span
          role="progressbar"
          aria-label={`Photo ${number} upload`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="absolute inset-x-0 bottom-0 h-1.5 bg-enamel/50"
        >
          <span
            className="block h-full bg-line-scarlet transition-[width] duration-150 ease-out"
            style={{ width: `${percent}%` }}
          />
        </span>
      ) : null}
      {locked ? null : item.kind === "saved" ? (
        <Button
          type="button"
          size="icon-sm"
          onClick={onToggleRemove}
          aria-label={removed ? `Keep photo ${number}` : `Remove photo ${number}`}
          className="absolute top-1.5 right-1.5 bg-enamel/85 text-on-enamel hover:bg-enamel"
        >
          {removed ? <RotateCcwIcon aria-hidden /> : <XIcon aria-hidden />}
        </Button>
      ) : (
        <Button
          type="button"
          size="icon-sm"
          onClick={onDiscard}
          aria-label={`Remove photo ${number}`}
          className="absolute top-1.5 right-1.5 bg-enamel/85 text-on-enamel hover:bg-enamel"
        >
          <XIcon aria-hidden />
        </Button>
      )}
    </div>
  );
}
