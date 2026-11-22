import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Stars } from "@/components/companies/Stars";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Button } from "@/components/ui/button";
import { companiesHref } from "@/lib/companyQuery";
import { companyHref } from "@/lib/routes";
import { listTopRatedCompanies } from "@/services/publicCompanies.service";
import type { TopRatedCompany } from "@/types";

async function loadTopRated(): Promise<TopRatedCompany[] | null> {
  try {
    return await listTopRatedCompanies();
  } catch {
    return null;
  }
}

export async function TopRatedCompanies() {
  await connection();
  const companies = await loadTopRated();
  if (companies === null) return null;

  return (
    <section aria-labelledby="top-rated-title" className="border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
        <div className="flex flex-col items-start gap-4 lg:col-span-4">
          <h2 id="top-rated-title" className="font-display text-3xl font-bold tracking-[-0.01em] uppercase sm:text-4xl">
            Top-rated companies
          </h2>
          <p className="max-w-[34ch] text-lg leading-relaxed text-muted-foreground">
            The employers job seekers rate highest, each with at least 5 ratings.
          </p>
          <Button asChild variant="outline" size="lg" className="w-fit">
            <Link href={companiesHref({ sort: "rating" })}>
              See all top-rated companies
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
        {companies.length === 0 ? (
          <p className="text-lg text-muted-foreground lg:col-span-8">No company has 5 ratings yet.</p>
        ) : (
          <ol className="flex flex-col lg:col-span-8">
            {companies.map((company) => {
              const name = company.companyName.trim() || "Company";
              return (
                <li
                  key={company.id}
                  className="relative flex items-center gap-4 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0"
                >
                  <AccountPhoto src={company.logoUrl} kind="company" alt="" size="row" fit="contain" />
                  <Link
                    href={companyHref(company.id)}
                    className="min-w-0 flex-1 truncate font-display text-xl font-bold tracking-[-0.01em] uppercase underline-offset-4 after:absolute after:inset-0 hover:underline hover:decoration-line-scarlet hover:decoration-2"
                  >
                    {name}
                  </Link>
                  <Stars rating={company.rating} size="md" />
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
