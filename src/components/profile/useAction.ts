"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formError, type FormError } from "@/lib/errors";

const NOTICE_MS = 6000;

export function useAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setError(null);
    setNotice(null);
  }, []);

  const fail = useCallback((value: FormError) => {
    window.clearTimeout(timer.current);
    setNotice(null);
    setError(value);
  }, []);

  const succeed = useCallback((message: string) => {
    window.clearTimeout(timer.current);
    setError(null);
    setNotice(message);
    timer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const run = useCallback(
    async (
      task: () => Promise<string | null>,
      byStatus?: Partial<Record<number, string>>,
    ): Promise<boolean> => {
      setPending(true);
      reset();
      try {
        const message = await task();
        if (message) succeed(message);
        return true;
      } catch (reason: unknown) {
        setError(formError(reason, byStatus));
        return false;
      } finally {
        setPending(false);
      }
    },
    [reset, succeed],
  );

  return { pending, error, notice, run, fail, succeed, reset };
}
