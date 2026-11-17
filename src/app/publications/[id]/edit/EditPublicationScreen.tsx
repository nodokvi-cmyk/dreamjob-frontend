"use client";

import { GateMessage } from "@/components/guards/GateStates";
import { FormPage, FormPageSkeleton } from "@/components/publications/FormPage";
import { PublicationForm } from "@/components/publications/PublicationForm";
import { PublicationLoadError, usePublication } from "@/components/publications/PublicationStates";
import { canEditPublication } from "@/lib/publications";
import { publicationHref } from "@/lib/routes";

export function EditPublicationScreen({ id }: { id: string }) {
  const { state, reload } = usePublication(id);

  if (state.status === "loading") return <FormPageSkeleton />;
  if (state.status === "failed") return <PublicationLoadError error={state.error} onRetry={reload} />;

  const { publication } = state.data;
  if (!canEditPublication(publication)) {
    const expired = publication.status === "expired";
    return (
      <GateMessage
        title={expired ? "Extend it first" : "Closed for good"}
        body={
          expired
            ? "Expired publications can't be edited. Extend it on its page, then edit it."
            : "A closed publication can't be edited. Create a new one instead."
        }
        action={{ label: "Back to publication", href: publicationHref(publication.id) }}
      />
    );
  }

  return (
    <FormPage
      title="Edit publication"
      lead={publication.title}
      status={publication.status}
      back={{ href: publicationHref(publication.id), label: "Publication" }}
    >
      <PublicationForm publication={publication} />
    </FormPage>
  );
}
