import { CircleSlashIcon, ExternalLinkIcon } from "lucide-react";
import { VacancyPhoto } from "@/components/vacancies/VacancyPhoto";
import { cn } from "@/lib/utils";
import { deadlineInfo, formatDate } from "@/lib/vacancy";
import type { Vacancy } from "@/types";

export function EndedBanner({ status }: { status: Vacancy["status"] }) {
  if (status !== "closed" && status !== "expired") return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-foreground/15 bg-muted px-4 py-3.5 sm:items-center"
    >
      <CircleSlashIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground sm:mt-0" />
      <p className="text-[1.02rem]">
        <span className="font-semibold">
          {status === "closed" ? "This vacancy is closed." : "This vacancy has expired."}
        </span>{" "}
        <span className="text-muted-foreground">
          {status === "closed"
            ? "The employer closed it. The details stay here for reference."
            : "Its deadline has passed. The details stay here for reference."}
        </span>
      </p>
    </div>
  );
}

function travelled(vacancy: Vacancy, now: number): number {
  if (vacancy.status === "closed" || vacancy.status === "expired") return 1;
  const start = Date.parse(vacancy.createdAt);
  const end = Date.parse(vacancy.deadline);
  if (end <= start) return 1;
  return Math.min(1, Math.max(0.06, (now - start) / (end - start)));
}

export function VacancyTrack({ vacancy, now }: { vacancy: Vacancy; now: number }) {
  const deadline = deadlineInfo(vacancy, now);
  const ended = deadline.tone === "ended";
  const share = travelled(vacancy, now);
  const endName =
    vacancy.status === "closed" ? "Closed" : ended ? "Expired" : "Closes";

  return (
    <ol aria-label="Vacancy timeline" className="flex flex-col gap-7">
      <li className="relative flex gap-4">
        <span
          aria-hidden
          className="absolute top-5 -bottom-8 left-[11px] w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-on-enamel/20"
        >
          <span
            className="block w-full origin-top rounded-full bg-line-scarlet motion-safe:animate-[fill-line_1.1s_var(--ease-out-expo)_0.2s_both]"
            style={{ height: `${share * 100}%` }}
          />
        </span>
        <span
          aria-hidden
          className="relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-[5px] border-line-scarlet bg-line-scarlet"
        />
        <span className="flex flex-col gap-1">
          <span className="transit-label text-base leading-none">Posted</span>
          <time dateTime={vacancy.createdAt} className="text-[0.95rem] text-on-enamel-muted">
            {formatDate(vacancy.createdAt)}
          </time>
        </span>
      </li>
      <li className="relative flex gap-4">
        <span
          aria-hidden
          className={cn(
            "relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-[5px]",
            ended
              ? "border-on-enamel bg-line-scarlet motion-safe:animate-[arrive_1.1s_ease-out_1s_both]"
              : deadline.tone === "soon"
                ? "border-line-amber bg-enamel"
                : "border-on-enamel/45 bg-enamel",
          )}
        />
        <span className="flex flex-col gap-1">
          <span className={cn("transit-label text-base leading-none", !ended && "text-on-enamel-muted")}>
            {endName} <time dateTime={vacancy.deadline}>{formatDate(vacancy.deadline)}</time>
          </span>
          {ended ? null : (
            <span
              className={cn(
                "text-[0.95rem]",
                deadline.tone === "soon" ? "font-medium text-line-amber" : "text-on-enamel-muted",
              )}
            >
              {deadline.label}
            </span>
          )}
        </span>
      </li>
    </ol>
  );
}

export function PhotoGallery({ photos, title }: { photos: Vacancy["photos"]; title: string }) {
  if (photos.length === 0) return null;
  const count = photos.length;

  return (
    <section aria-label="Photos">
      <ul className={cn("grid gap-3", count > 1 && "grid-cols-2")}>
        {photos.map((photo, index) => {
          const wide = count === 1 || (count === 3 && index === 0);
          return (
            <li key={photo.id} className={cn(wide && count === 3 && "col-span-2")}>
              <a
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/photo relative block overflow-hidden rounded-xl border border-border bg-muted",
                  wide ? "aspect-[16/9]" : "aspect-[4/3]",
                )}
              >
                <VacancyPhoto
                  src={photo.url}
                  alt={`${title}, photo ${index + 1} of ${count}`}
                  width={wide ? 1200 : 800}
                  height={wide ? 675 : 600}
                  priority={index === 0}
                  className="transition-transform duration-500 ease-out group-hover/photo:scale-[1.02]"
                />
                <span className="absolute right-2.5 bottom-2.5 grid size-8 place-items-center rounded-lg bg-enamel/80 text-on-enamel opacity-0 transition-opacity group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100">
                  <ExternalLinkIcon aria-hidden className="size-4" />
                </span>
                <span className="sr-only">Open full size in a new tab</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
