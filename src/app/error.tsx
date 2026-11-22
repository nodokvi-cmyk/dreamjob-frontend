"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="grid flex-1 place-items-center px-4 py-24">
      <div role="alert" className="flex max-w-lg flex-col items-center gap-5 text-center">
        <div aria-hidden className="flex items-center">
          <span className="h-1.5 w-16 rounded-full bg-line-scarlet" />
          <span className="size-6 rounded-full border-[5px] border-foreground bg-background" />
          <span className="h-1.5 w-16 rounded-full border-2 border-dashed border-muted-foreground/50" />
        </div>
        <h1 className="font-display text-5xl font-bold tracking-[-0.02em] uppercase">
          The line is delayed
        </h1>
        <p className="text-lg text-muted-foreground">
          Something went wrong on our side. Try again, and if it keeps happening, come back in a few
          minutes.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={routes.home}>Home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
