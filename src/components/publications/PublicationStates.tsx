"use client";

import { useEffect } from "react";
import { useLoad } from "@/components/dashboard/useLoad";
import { GateMessage } from "@/components/guards/GateStates";
import { ResultsError } from "@/components/vacancies/ListStates";
import { useAuth } from "@/context/AuthContext";
import { formError, isUserGone } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { getPublication } from "@/services/publications.service";

export function usePublication(id: string) {
  const { signOut } = useAuth();
  const result = useLoad(`publication:${id}`, async (signal) => {
    const publication = await getPublication(id, signal);
    return { publication, now: Date.now() };
  });
  const gone = result.state.status === "failed" && isUserGone(result.state.error);
  useEffect(() => {
    if (gone) signOut();
  }, [gone, signOut]);
  return result;
}

export function PublicationLoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  if (error instanceof ApiError && [400, 403, 404].includes(error.status)) {
    return (
      <GateMessage
        title="Publication not found"
        body="It may have been deleted, or it belongs to another account."
        action={{ label: "My publications", href: routes.publications }}
      />
    );
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <ResultsError title="This publication didn't load" body={formError(error).message} onRetry={onRetry} />
    </div>
  );
}
