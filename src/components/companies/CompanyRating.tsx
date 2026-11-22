"use client";

import Link from "next/link";
import { useState } from "react";
import { StarPicker } from "@/components/companies/StarPicker";
import { Stars } from "@/components/companies/Stars";
import { useLoad } from "@/components/dashboard/useLoad";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formError, isUserGone } from "@/lib/errors";
import { formatRating, ratingCountText } from "@/lib/rating";
import { companyHref, signInWithNext } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { deleteRating, getMyCompanyProfile, putRating } from "@/services/companies.service";
import type { RatingResult } from "@/types";

interface CompanyRatingProps {
  companyId: string;
  rating: number | null;
  ratingCount: number;
}

interface Saved {
  key: string;
  result: RatingResult;
}

export function CompanyRating({ companyId, rating, ratingCount }: CompanyRatingProps) {
  const { status, session, signOut } = useAuth();
  const isUser = session?.accountRole === "user";
  const loadKey = isUser ? `${companyId}:${session.accountId}` : `${companyId}:none`;
  const [saved, setSaved] = useState<Saved | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state, reload } = useLoad(loadKey, (signal) =>
    isUser ? getMyCompanyProfile(companyId, signal) : Promise.resolve(null),
  );

  const profile = state.status === "ready" ? state.data : null;
  const base: RatingResult = profile
    ? { rating: profile.rating, ratingCount: profile.ratingCount, myRating: profile.myRating }
    : { rating, ratingCount, myRating: null };
  const current = saved && saved.key === loadKey ? saved.result : base;

  async function run(action: () => Promise<RatingResult>) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await action();
      setSaved({ key: loadKey, result });
    } catch (failure: unknown) {
      if (isUserGone(failure)) {
        signOut();
        return;
      }
      setError(formError(failure).message);
      if (failure instanceof ApiError && failure.status === 404) {
        setSaved(null);
        reload();
      }
    } finally {
      setPending(false);
    }
  }

  const loadingMine = isUser && state.status === "loading";
  const failedMine = isUser && state.status === "failed";
  const signedOut = status === "anonymous";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {current.rating === null ? (
          <p className="text-[1.02rem] text-muted-foreground">No ratings yet</p>
        ) : (
          <>
            <Stars rating={current.rating} size="lg" />
            <p className="text-[1.02rem]">
              <span className="font-semibold tabular">{formatRating(current.rating)}</span>{" "}
              <span className="text-muted-foreground">({ratingCountText(current.ratingCount)})</span>
            </p>
          </>
        )}
      </div>

      {signedOut ? (
        <Link
          href={signInWithNext(companyHref(companyId))}
          className="w-fit text-[0.95rem] font-semibold text-cobalt-ink underline-offset-4 hover:underline"
        >
          Sign in to rate
        </Link>
      ) : null}

      {isUser && !failedMine ? (
        <div className="flex flex-col gap-1.5" aria-busy={loadingMine || pending}>
          <p className="transit-label text-[0.85rem] text-muted-foreground">Your rating</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarPicker
              value={current.myRating}
              disabled={loadingMine || pending}
              label="Your rating for this company"
              onPick={(stars) => void run(() => putRating(companyId, stars))}
            />
            {current.myRating !== null ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-disabled={pending}
                className="aria-disabled:opacity-50"
                onClick={() => {
                  if (!pending) void run(() => deleteRating(companyId));
                }}
              >
                Remove rating
              </Button>
            ) : null}
          </div>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {loadingMine
              ? "Loading your rating..."
              : current.myRating === null
                ? "You haven't rated this company."
                : `You rated this company ${current.myRating} out of 5.`}
          </p>
        </div>
      ) : null}

      {failedMine ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">Your rating didn&apos;t load.</p>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
