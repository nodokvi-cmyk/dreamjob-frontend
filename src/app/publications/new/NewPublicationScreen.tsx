"use client";

import { useLoad } from "@/components/dashboard/useLoad";
import { GateMessage } from "@/components/guards/GateStates";
import { FormPage, FormPageSkeleton } from "@/components/publications/FormPage";
import { PublicationForm } from "@/components/publications/PublicationForm";
import { LIMIT_REACHED, MAX_ACTIVE_PUBLICATIONS } from "@/lib/publications";
import { routes } from "@/lib/routes";
import { countActivePublications } from "@/services/publications.service";

export function NewPublicationScreen() {
  const { state } = useLoad("publications:active", (signal) => countActivePublications(signal));

  if (state.status === "loading") return <FormPageSkeleton label="Loading" />;
  if (state.status === "ready" && state.data >= MAX_ACTIVE_PUBLICATIONS) {
    return (
      <GateMessage
        title="3 of 3 active"
        body={LIMIT_REACHED}
        action={{ label: "My publications", href: routes.publications }}
      />
    );
  }

  return (
    <FormPage
      title="New publication"
      lead="Say what job you are looking for. It goes to our team for review, then approved companies can find it and invite you."
      back={{ href: routes.publications, label: "My publications" }}
    >
      <PublicationForm />
    </FormPage>
  );
}
