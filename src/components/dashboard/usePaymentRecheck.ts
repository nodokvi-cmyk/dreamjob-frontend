"use client";

import { useCallback, useEffect, useRef } from "react";
import { PAYMENT_RECHECK_MS } from "@/lib/vacancyLifecycle";

export function usePaymentRecheck(onRecheck: () => void): () => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(onRecheck);

  useEffect(() => {
    latest.current = onRecheck;
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      latest.current();
    }, PAYMENT_RECHECK_MS);
  }, []);
}
