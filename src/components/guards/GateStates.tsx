"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type GateAction = { label: string; onClick: () => void } | { label: string; href: string };

export function GateSpinner({ label = "Loading your account" }: { label?: string }) {
  return (
    <div role="status" className="grid flex-1 place-items-center px-4 py-24">
      <div className="flex flex-col items-center gap-5">
        <div aria-hidden className="flex items-center">
          <span className="h-1 w-10 rounded-full bg-line-scarlet/40" />
          <span className="size-5 rounded-full border-4 border-foreground bg-background motion-safe:animate-[station-pulse_1.2s_ease-in-out_infinite]" />
          <span className="h-1 w-10 rounded-full bg-line-scarlet/40" />
        </div>
        <p className="transit-label text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function GateMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: GateAction;
}) {
  return (
    <div className="grid flex-1 place-items-center px-4 py-24">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span
          aria-hidden
          className="size-6 rounded-full border-4 border-line-scarlet bg-background"
        />
        <h1 className="font-display text-3xl font-bold tracking-[-0.01em] uppercase">{title}</h1>
        <p className="text-muted-foreground">{body}</p>
        {"href" in action ? (
          <Button asChild className="mt-2">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
