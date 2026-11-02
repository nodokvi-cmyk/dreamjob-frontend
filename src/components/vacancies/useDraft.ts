"use client";

import { useEffect, useEffectEvent, useState } from "react";

const TYPING_DELAY = 450;

export function useDraft(incoming: string, commit: (value: string) => void) {
  const [draft, setDraft] = useState(incoming);
  const [synced, setSynced] = useState(incoming);
  const [sent, setSent] = useState(incoming);

  if (incoming !== synced) {
    setSynced(incoming);
    if (incoming !== sent) {
      setSent(incoming);
      setDraft(incoming);
    }
  }

  const onCommit = useEffectEvent((value: string) => {
    setSent(value);
    commit(value);
  });

  useEffect(() => {
    const value = draft.trim();
    if (value === sent) return;
    const timer = window.setTimeout(() => onCommit(value), TYPING_DELAY);
    return () => window.clearTimeout(timer);
  }, [draft, sent]);

  return { draft, setDraft, markSent: setSent };
}
