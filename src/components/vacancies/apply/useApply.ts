"use client";

import { useCallback, useState } from "react";
import { useViewerMarks } from "@/components/vacancies/ViewerMarks";
import { useAuth } from "@/context/AuthContext";
import { APPLICATION_FILE_LABEL } from "@/lib/applications";
import { formError, type FormError } from "@/lib/errors";
import { ApiError } from "@/services/api";
import { applyToVacancy } from "@/services/applications.service";
import type { ApplyInput } from "@/types";

export function useApply(vacancyId: string) {
  const { update } = useViewerMarks();
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);

  const reset = useCallback(() => setError(null), []);

  const send = useCallback(
    async (input: ApplyInput): Promise<boolean> => {
      setPending(true);
      setError(null);
      try {
        const application = await applyToVacancy(vacancyId, input);
        update(vacancyId, {
          myApplication: {
            id: application.id,
            status: application.status,
            canReapply: false,
            submissions: application.submissions,
          },
        });
        return true;
      } catch (caught: unknown) {
        if (caught instanceof ApiError && caught.status === 404 && caught.message === "User not found") {
          signOut();
          return false;
        }
        setError(formError(caught, { 413: `Each file can be at most ${APPLICATION_FILE_LABEL}.` }));
        return false;
      } finally {
        setPending(false);
      }
    },
    [vacancyId, update, signOut],
  );

  return { pending, error, send, reset, fail: setError };
}
