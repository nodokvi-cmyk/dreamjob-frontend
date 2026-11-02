"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

export function useRefocus(ready: boolean): [RefObject<HTMLHeadingElement | null>, () => void] {
  const target = useRef<HTMLHeadingElement | null>(null);
  const wanted = useRef(false);

  useEffect(() => {
    if (!ready || !wanted.current) return;
    wanted.current = false;
    const active = document.activeElement;
    if (!active || active === document.body || !document.body.contains(active)) {
      target.current?.focus();
    }
  }, [ready]);

  const request = useCallback(() => {
    wanted.current = true;
  }, []);

  return [target, request];
}
