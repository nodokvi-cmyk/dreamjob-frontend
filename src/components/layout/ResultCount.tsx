const numbers = new Intl.NumberFormat("en-GB");

export function ResultCount({
  total,
  singular,
  plural,
  filter,
}: {
  total: number;
  singular: string;
  plural: string;
  filter?: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span className="inline-flex items-baseline gap-2">
        <span className="font-display text-[2rem] leading-none font-bold text-foreground tabular">
          {numbers.format(total)}
        </span>
        <span className="transit-label text-[0.9rem] text-muted-foreground">
          {total === 1 ? singular : plural}
        </span>
      </span>
      {filter ? (
        <span className="inline-flex items-center self-center rounded-full border border-foreground/20 px-2.5 py-0.5 text-sm font-medium text-foreground">
          {filter}
        </span>
      ) : null}
    </span>
  );
}
