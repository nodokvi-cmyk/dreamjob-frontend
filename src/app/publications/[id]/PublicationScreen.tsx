"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileButtons } from "@/components/applications/ApplicationFiles";
import { StatusBadge } from "@/components/dashboard/VacancyStatus";
import { FormAlert } from "@/components/form/FormAlert";
import { GateSpinner } from "@/components/guards/GateStates";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { InvitesSwitch, PublicationActions } from "@/components/publications/OwnerControls";
import { PublicationLoadError, usePublication } from "@/components/publications/PublicationStates";
import { CompanyPublicationView } from "@/components/publications/CompanyPublicationView";
import { PublicationSkeleton, PublicationView } from "@/components/publications/PublicationView";
import { useAuth } from "@/context/AuthContext";
import { REJECTED_NOTE, canEditPublication, publicationTiming } from "@/lib/publications";
import { editPublicationHref, routes } from "@/lib/routes";
import { formatDateTime } from "@/lib/vacancy";
import { getPublicationFile } from "@/services/publications.service";

export function PublicationScreen({ id }: { id: string }) {
  const { session } = useAuth();
  if (!session) return <GateSpinner />;
  if (session.accountRole === "company") return <CompanyPublicationView id={id} account={session.account} />;
  return <OwnerPublication id={id} />;
}

function OwnerPublication({ id }: { id: string }) {
  const router = useRouter();
  const { state, reload } = usePublication(id);
  const { notice, succeed } = useAction();
  const [problem, setProblem] = useState<string | null>(null);

  if (state.status === "loading") return <PublicationSkeleton />;
  if (state.status === "failed") return <PublicationLoadError error={state.error} onRetry={reload} />;

  const { publication, now } = state.data;
  const closedOrExpired = publication.status === "closed" || publication.status === "expired";

  return (
    <PublicationView
      publication={publication}
      back={{ href: routes.publications, label: "My publications" }}
      status={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge status={publication.status} />
          <InvitesSwitch
            publication={publication}
            onError={setProblem}
            onChanged={(next) => {
              succeed(next.acceptingInvites ? "Companies can find and invite you again." : "Hidden from companies.");
              reload();
            }}
          />
        </div>
      }
      strip={
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-[1.02rem]">
            {publicationTiming(publication)}
            <span className="text-muted-foreground">
              {" "}
              · Updated <time dateTime={publication.updatedAt}>{formatDateTime(publication.updatedAt)}</time>
            </span>
          </p>
          {publication.acceptingInvites || closedOrExpired ? null : (
            <p className="text-[0.95rem] text-muted-foreground">
              Companies can&apos;t find or open it, and no new invitations come in. Invitations you already
              received stay. The 60-day timer keeps running.
            </p>
          )}
          {publication.status === "rejected" ? (
            <div className="flex flex-col gap-2 rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-[0.95rem]">
                <span className="font-semibold">Our team&apos;s note: </span>
                <span className="break-words whitespace-pre-line">
                  {publication.rejectionReason || "No reason was given."}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{REJECTED_NOTE}</p>
              {canEditPublication(publication) ? (
                <Link
                  href={editPublicationHref(publication.id)}
                  className="inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
                >
                  Edit and resend
                  <ArrowRightIcon aria-hidden className="size-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <p className="transit-label text-[0.8rem] text-muted-foreground">Files</p>
            <div className="flex flex-wrap items-center gap-2">
              <FileButtons
                hasCv={publication.hasCv}
                hasCoverLetter={publication.hasCoverLetter}
                loadCv={() => getPublicationFile(publication.id, "cv")}
                loadCoverLetter={() => getPublicationFile(publication.id, "coverLetter")}
                onError={setProblem}
              />
              {publication.hasCv || publication.hasCoverLetter ? null : (
                <span className="text-sm text-muted-foreground">No CV or cover letter attached.</span>
              )}
            </div>
          </div>
          <PublicationActions
            publication={publication}
            now={now}
            onError={setProblem}
            onChanged={(_, message) => {
              succeed(message);
              reload();
            }}
            onDeleted={() => router.push(routes.publications)}
          />
          {problem ? <FormAlert tone="error" message={problem} /> : null}
          <Notice message={notice} />
        </div>
      }
    />
  );
}
