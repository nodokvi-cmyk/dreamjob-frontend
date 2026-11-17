"use client";

import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { InvitationStatusBadge } from "@/components/invitations/InvitationStatus";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Button } from "@/components/ui/button";
import { CompanyWarning } from "@/components/vacancies/VacancyEmployer";
import { ReasonTip } from "@/components/vacancies/ReasonTip";
import { myApplicationsHref } from "@/lib/applicationQuery";
import { isUserGone } from "@/lib/errors";
import { ACCEPT_NOTE, acceptBlockedReason, invitationRowId, usesReapply } from "@/lib/invitations";
import { companyHref, publicationHref, vacancyHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/vacancy";
import { ApiError } from "@/services/api";
import { acceptInvitation, declineInvitation } from "@/services/invitations.service";
import type { AcceptResult, InboxInvitation } from "@/types";

interface InboxRowProps {
  invitation: InboxInvitation;
  focused: boolean;
  onAccepted: (result: AcceptResult, title: string) => void;
  onDeclined: () => void;
  onStale: (message: string) => void;
  onUserGone: () => void;
}

function vacancyLine(vacancy: InboxInvitation["vacancy"]): string | null {
  if (!vacancy) return null;
  if (vacancy.status === "unavailable") return "Temporarily unavailable";
  if (vacancy.status === "closed") return "Closed";
  if (vacancy.status === "expired") return `Expired on ${formatDate(vacancy.deadline)}`;
  return `Closes ${formatDate(vacancy.deadline)}`;
}

export function InboxRow({ invitation, focused, onAccepted, onDeclined, onStale, onUserGone }: InboxRowProps) {
  const { vacancy, company, publication, application } = invitation;
  const blocked = acceptBlockedReason(invitation);
  const reapply = usesReapply(invitation);
  const vacancyTitle = vacancy?.title || "this vacancy";
  const linkable = vacancy !== null && vacancy.status !== "unavailable";
  const companyName = company.companyName.trim() || "Company";

  const accept = (
    <ConfirmDialog
      trigger={
        <Button type="button" size="sm">
          <CheckIcon aria-hidden />
          Accept
        </Button>
      }
      title="Accept this invitation?"
      description={
        <div className="flex flex-col gap-3">
          <p>
            Accepting applies to <span className="font-semibold text-foreground">{vacancyTitle}</span> with the CV and
            cover letter of your publication. {ACCEPT_NOTE}
          </p>
          {reapply ? (
            <p className="font-medium text-foreground">
              You applied here before and {reapply === "rejected" ? "were rejected" : "withdrew"}. Accepting uses your
              only reapply.
            </p>
          ) : null}
        </div>
      }
      confirmLabel="Accept and apply"
      pendingLabel="Accepting"
      icon={<CheckIcon aria-hidden />}
      onConfirm={async () => {
        try {
          onAccepted(await acceptInvitation(invitation.id), vacancyTitle);
        } catch (error: unknown) {
          if (isUserGone(error)) {
            onUserGone();
            return;
          }
          throw error;
        }
      }}
    />
  );

  return (
    <article
      id={invitationRowId(invitation.id)}
      tabIndex={-1}
      aria-labelledby={`${invitationRowId(invitation.id)}-title`}
      className={cn(
        "flex scroll-mt-28 flex-col gap-4 rounded-xl border bg-card px-4 py-5 outline-none sm:px-5",
        focused ? "border-line-cobalt ring-3 ring-line-cobalt/30" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <InvitationStatusBadge status={invitation.status} />
        <span className="text-sm text-muted-foreground">
          Received <time dateTime={invitation.createdAt}>{formatDateTime(invitation.createdAt)}</time>
          {invitation.respondedAt ? (
            <>
              {" · "}Answered <time dateTime={invitation.respondedAt}>{formatDate(invitation.respondedAt)}</time>
            </>
          ) : null}
        </span>
      </div>

      <div className="flex min-w-0 items-start gap-3">
        <AccountPhoto src={company.logoUrl} kind="company" alt="" size="row" fit="contain" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[0.95rem]">
            {company.approved ? (
              <Link href={companyHref(company.id)} className="font-semibold underline-offset-4 hover:underline">
                {companyName}
              </Link>
            ) : (
              <span className="font-semibold">{companyName}</span>
            )}{" "}
            <span className="text-muted-foreground">invited you to apply to</span>
          </p>
          <h2
            id={`${invitationRowId(invitation.id)}-title`}
            className="font-display text-[1.35rem] leading-[1.15] font-semibold break-words"
          >
            {vacancy ? (
              linkable ? (
                <Link href={vacancyHref(vacancy.id)} className="decoration-line-scarlet decoration-2 underline-offset-4 hover:underline">
                  {vacancy.title}
                </Link>
              ) : (
                vacancy.title
              )
            ) : (
              <span className="text-muted-foreground">Deleted vacancy</span>
            )}
          </h2>
          {vacancyLine(vacancy) ? <p className="text-sm text-muted-foreground">{vacancyLine(vacancy)}</p> : null}
          {company.approved ? null : <CompanyWarning />}
        </div>
      </div>

      {invitation.message ? (
        <blockquote className="max-w-[70ch] border-l-2 border-line-cobalt/60 pl-3 text-[0.95rem] break-words whitespace-pre-line">
          {invitation.message}
        </blockquote>
      ) : null}

      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.95rem] text-muted-foreground">
        <span>
          For your publication{" "}
          {publication ? (
            <Link href={publicationHref(publication.id)} className="font-medium text-foreground underline-offset-4 hover:underline">
              {publication.title}
            </Link>
          ) : (
            "that was deleted"
          )}
        </span>
        {application ? (
          <Link
            href={myApplicationsHref({ focus: application.id })}
            className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
          >
            Your application <ApplicationStatusBadge status={application.status} />
          </Link>
        ) : null}
      </p>

      {invitation.status === "invited" ? (
        <div className="flex flex-wrap items-center gap-2">
          {blocked ? (
            <ReasonTip reason={blocked}>
              <Button type="button" size="sm" disabled tabIndex={-1}>
                <CheckIcon aria-hidden />
                Accept
              </Button>
            </ReasonTip>
          ) : (
            accept
          )}
          <ConfirmDialog
            trigger={
              <Button type="button" variant="outline" size="sm">
                <XIcon aria-hidden />
                Decline
              </Button>
            }
            title="Decline this invitation?"
            description={
              <p>
                {companyName} can&apos;t invite this publication again. You can still apply to the vacancy the usual
                way.
              </p>
            }
            confirmLabel="Decline"
            pendingLabel="Declining"
            cancelLabel="Keep it"
            onConfirm={async () => {
              try {
                await declineInvitation(invitation.id);
              } catch (error: unknown) {
                if (error instanceof ApiError && (error.status === 400 || error.status === 409)) {
                  onStale(error.message);
                  return;
                }
                throw error;
              }
              onDeclined();
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
