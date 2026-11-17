"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { useLoad } from "@/components/dashboard/useLoad";
import { InboxRow } from "@/components/invitations/InboxRow";
import { InvitationStatusLine, ListSkeletonRows } from "@/components/invitations/InvitationStatus";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useAuth } from "@/context/AuthContext";
import { formError, isUserGone } from "@/lib/errors";
import { INVITATIONS_PAGE_SIZE, inboxHref, invitationRowId, parseInboxQuery } from "@/lib/invitations";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { listMyInvitations } from "@/services/invitations.service";
import type { AcceptResult } from "@/types";

const numbers = new Intl.NumberFormat("en-GB");

export function InboxScreen() {
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const query = useMemo(() => parseInboxQuery(Object.fromEntries(searchParams)), [searchParams]);
  const { state, reload } = useLoad(inboxHref(query), (signal) =>
    listMyInvitations(query, INVITATIONS_PAGE_SIZE, signal),
  );
  const { notice, succeed } = useAction();
  const [failure, setFailure] = useState<string | null>(null);
  const scrolled = useRef<string | null>(null);
  const base = { ...query, focus: undefined };
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;
  const gone = state.status === "failed" && isUserGone(state.error);

  useEffect(() => {
    if (gone) signOut();
  }, [gone, signOut]);

  useEffect(() => {
    if (state.status !== "ready" || !query.focus || scrolled.current === query.focus) return;
    scrolled.current = query.focus;
    const row = document.getElementById(invitationRowId(query.focus));
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.focus({ preventScroll: true });
  }, [state.status, query.focus]);

  const accepted = (result: AcceptResult, title: string) => {
    setFailure(null);
    succeed(
      result.invitation
        ? `Accepted. Your application to “${title}” is sent.`
        : `The invitation changed at the same moment, but your application to “${title}” stands.`,
    );
    reload();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Invitations
            </h1>
            <p className="max-w-[62ch] text-lg text-muted-foreground">
              Companies that found your publications and invited you to apply. Accepting sends your publication&apos;s
              CV and cover letter and shares your email and phone with that company.
            </p>
          </div>
          <InvitationStatusLine active={query.status} href={(status) => inboxHref({ ...base, status, page: 1 })} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading your invitations" : null
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
                      <InboxRow
                        invitation={invitation}
                        focused={invitation.id === query.focus}
                        onAccepted={accepted}
                        onDeclined={() => {
                          setFailure(null);
                          succeed("Invitation declined.");
                          reload();
                        }}
                        onStale={(message) => {
                          setFailure(message);
                          reload();
                        }}
                        onUserGone={signOut}
                      />
                    </li>
                  ))}
                </ul>
                <Pagination
                  href={(page) => inboxHref({ ...base, page })}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={inboxHref({ ...base, page: 1 })} />
            ) : (
              <ListMessage
                title={query.status ? "Nothing on this line" : "No invitations yet"}
                body={
                  query.status
                    ? "No invitations have this status."
                    : "When an approved company invites one of your publications, it shows up here. Keep a publication live and open to invites."
                }
                action={
                  <Button asChild size="lg">
                    <Link href={routes.publications}>My publications</Link>
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
