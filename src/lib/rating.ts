export const MAX_RATING = 5;

export const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function ratingLabel(rating: number): string {
  return `Rated ${formatRating(rating)} out of ${MAX_RATING}`;
}

export function ratingCountText(count: number): string {
  return `${count} ${count === 1 ? "rating" : "ratings"}`;
}

export function fillPercent(rating: number): number {
  const clamped = Math.min(MAX_RATING, Math.max(0, rating));
  return (clamped / MAX_RATING) * 100;
}
