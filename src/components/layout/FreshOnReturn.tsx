"use client";

import { Fragment, useLayoutEffect, useState, type ReactNode } from "react";

export function FreshOnReturn({ children }: { children: ReactNode }) {
  const [round, setRound] = useState(0);

  useLayoutEffect(() => () => setRound((value) => value + 1), []);

  return <Fragment key={round}>{children}</Fragment>;
}
