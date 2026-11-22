"use client";

import Link from "next/link";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-background px-4 text-foreground">
        <div role="alert" className="flex max-w-lg flex-col items-center gap-5 text-center">
          <h1 className="text-5xl font-bold tracking-tight uppercase">The line is delayed</h1>
          <p className="text-lg text-muted-foreground">
            Something went wrong on our side. Try again, and if it keeps happening, come back in a
            few minutes.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="h-11 rounded-md bg-foreground px-6 font-medium text-background"
            >
              Try again
            </button>
            <Link href="/" className="inline-flex h-11 items-center rounded-md border border-border px-6 font-medium">
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
