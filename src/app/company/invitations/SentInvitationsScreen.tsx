"use client";

import { ArrowRightIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { useLoad } from "@/components/dashboard/useLoad";
import { CancelInvitation } from "@/components/invitations/CancelInvitation";
import { InvitationStatusBadge, InvitationStatusLine, ListSkeletonRows } from "@/components/invitations/InvitationStatus";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { applicantsHref } from "@/lib/applicantQuery";
import { formError } from "@/lib/errors";
import { INVITATIONS_PAGE_SIZE, parseSentQuery, quotaText, sentInvitationsHref } from "@/lib/invitations";
import { ownVacancyHref, publicationHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/vacancy";
import { getInvitationQuota, listSentInvitations } from "@/services/invitations.service";
import type { SentInvitation } from "@/types";

const numbers = new Intl.NumberFormat("en-GB");

export function SentInvitationsScreen() {
  const searchParams = useSearchParams();
  const query = useMemo(() => parseSentQuery(Object.fromEntries(searchParams)), [searchParams]);
  const { state, reload } = useLoad(sentInvitationsHref(query), (signal) =>
    listSentInvitations(query, INVITATIONS_PAGE_SIZE, signal),
  );
  const quota = useLoad("quota", (signal) => getInvitationQuota(signal));
  const { notice, succeed } = useAction();
  const [failure, setFailure] = useState<string | null>(null);
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;
  const vacancyTitle =
    query.vacancyId && state.status === "ready"
      ? state.data.items.find((item) => item.vacancy?.id === query.vacancyId)?.vacancy?.title
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
                Sent invitations
              </h1>
              <p className="max-w-[62ch] text-lg text-muted-foreground">
                Job seekers you invited to apply, newest first. An accepted invitation arrives as an application.
              </p>
            </div>
            {quota.state.status === "ready" ? (
              <p className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-line-cobalt/60 bg-background px-3.5 transit-label text-[0.85rem]">
                {quotaText(quota.state.data)}
              </p>
            ) : null}
          </div>
          <InvitationStatusLine
            active={query.status}
            href={(status) => sentInvitationsHref({ ...query, status, page: 1 })}
          />
          <div className="flex flex-wrap items-center gap-3">
            {query.vacancyId ? (
              <Link
                href={sentInvitationsHref({ ...query, vacancyId: undefined, page: 1 })}
                scroll={false}
                className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-foreground/20 bg-card pr-2 pl-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/45 hover:bg-muted"
              >
                <span className="truncate">Vacancy: {vacancyTitle || "selected vacancy"}</span>
                <XIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <span className="sr-only">Remove vacancy filter</span>
              </Link>
            ) : null}
            <Link href={routes.board} className="text-sm font-medium text-cobalt-ink underline-offset-4 hover:underline">
              Browse job seekers
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading invitations" : null
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {numbers.format(total)}
                  </span>{" "}
                  {total === 1 ? "invitation" : "invitations"}
                </>
              )}
            </p>
            <Notice message={notice} />
          </div>
          <StaleAlert message={failure} />
          <div
            aria-busy={state.status === "loading" || busy}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              busy && "pointer-events-none opacity-55 motion-safe:delay-150",
            )}
          >
            {state.status === "loading" ? (
              <ListSkeletonRows />
            ) : state.status === "failed" ? (
              <ResultsError body={formError(state.error).message} onRetry={reload} />
            ) : state.data.items.length > 0 ? (
              <>
                <ul className="flex flex-col gap-3">
                  {state.data.items.map((invitation) => (
                    <li key={invitation.id}>
                      <SentRow
                        invitation={invitation}
                        filtered={query.vacancyId !== undefined}
                        onCancelled={() => {
                          setFailure(null);
                          succeed("Invitation cancelled.");
                          reload();
                        }}
                        onStale={(message) => {
                          setFailure(message);
                          reload();
                        }}
                      />
                    </li>
                  ))}
                </ul>
                <Pagination
                  href={(page) => sentInvitationsHref({ ...query, page })}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={sentInvitationsHref({ ...query, page: 1 })} />
            ) : (
              <ListMessage
                title={query.status || query.vacancyId ? "Nothing on this line" : "No invitations yet"}
                body={
                  query.status || query.vacancyId
                    ? "No invitations match this filter."
                    : "Browse job seekers' publications and invite the ones that fit one of your live vacancies."
                }
                action={
                  <Button asChild size="lg">
                    <Link href={routes.board}>Browse job seekers</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SentRow({
  invitation,
  filtered,
  onCancelled,
  onStale,
}: {
  invitation: SentInvitation;
  filtered: boolean;
  onCancelled: () => void;
  onStale: (message: string) => void;
}) {
  const { vacancy, publication } = invitation;
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <InvitationStatusBadge status={invitation.status} />
        <span className="text-sm text-muted-foreground">
          Sent <time dateTime={invitation.createdAt}>{formatDateTime(invitation.createdAt)}</time>
          {invitation.respondedAt ? (
            <>
              {" · "}Answered <time dateTime={invitation.respondedAt}>{formatDate(invitation.respondedAt)}</time>
            </>
          ) : null}
        </span>
      </div>
      <h2 className="font-display text-[1.35rem] leading-[1.15] font-semibold break-words">
        {publication ? (
          invitation.publicationAvailable ? (
            <Link href={publicationHref(publication.id)} className="decoration-line-scarlet decoration-2 underline-offset-4 hover:underline">
              {publication.title}
            </Link>
          ) : (
            publication.title
          )
        ) : (
          <span className="text-muted-foreground">Deleted publication</span>
        )}
      </h2>
      {publication && !invitation.publicationAvailable ? (
        <p className="text-sm text-muted-foreground">This publication is no longer available to you.</p>
      ) : null}
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
        <span>
          For{" "}
          {vacancy ? (
            <Link href={ownVacancyHref(vacancy.id)} className="font-medium text-foreground underline-offset-4 hover:underline">
              {vacancy.title}
            </Link>
          ) : (
            "a deleted vacancy"
          )}
        </span>
        {vacancy && !filtered ? (
          <Link
            href={sentInvitationsHref({ vacancyId: vacancy.id })}
            className="font-medium text-cobalt-ink underline-offset-4 hover:underline"
          >
            Only this vacancy
          </Link>
        ) : null}
      </p>
      {invitation.message ? (
        <p className="max-w-[70ch] text-[0.95rem] break-words whitespace-pre-line">{invitation.message}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {invitation.status === "invited" ? (
          <CancelInvitation invitationId={invitation.id} size="sm" onDone={onCancelled} onStale={onStale} />
        ) : null}
        {invitation.status === "accepted" && vacancy && invitation.applicationId ? (
          <Button asChild size="sm">
            <Link href={applicantsHref(vacancy.id, { focus: invitation.applicationId })}>
              Open application
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
