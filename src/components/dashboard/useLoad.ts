"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";

type Settled<T> =
  | { key: string; revision: number; ok: true; data: T }
  | { key: string; revision: number; ok: false; error: unknown };

export type LoadState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T; refreshing: boolean }
  | { status: "failed"; error: unknown; refreshing: boolean };

export function useLoad<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const run = useEffectEvent(load);

  useEffect(() => {
    const controller = new AbortController();
    run(controller.signal).then(
      (data) => setSettled({ key, revision, ok: true, data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setSettled({ key, revision, ok: false, error });
      },
    );
    return () => controller.abort();
  }, [key, revision]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);

  const fresh = settled !== null && settled.key === key;
  const refreshing = !fresh || settled.revision !== revision;
  let state: LoadState<T>;
  if (settled === null) state = { status: "loading" };
  else if (settled.ok) state = { status: "ready", data: settled.data, refreshing };
  else if (fresh) state = { status: "failed", error: settled.error, refreshing };
  else state = { status: "loading" };

  return { state, reload };
}
