import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <section className="grid flex-1 place-items-center px-4 py-24">
      <div className="flex max-w-lg flex-col items-center gap-5 text-center">
        <div aria-hidden className="flex items-center">
          <span className="h-1.5 w-16 rounded-full bg-line-scarlet" />
          <span className="size-6 rounded-full border-[5px] border-foreground bg-background" />
          <span className="h-1.5 w-16 rounded-full border-2 border-dashed border-muted-foreground/50" />
        </div>
        <h1 className="font-display text-5xl font-bold tracking-[-0.02em] uppercase">
          This stop doesn&apos;t exist
        </h1>
        <p className="text-lg text-muted-foreground">
          The page you&apos;re looking for isn&apos;t on the DreamJob line. It may have moved, or
          the vacancy may have closed.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={routes.vacancies}>Browse vacancies</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={routes.home}>Home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
