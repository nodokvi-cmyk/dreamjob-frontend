import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ResultsError } from "@/components/vacancies/ListStates";
import { VacancyDetailView } from "@/components/vacancies/VacancyDetail";
import { routes } from "@/lib/routes";
import { EMPLOYMENT_TYPE_LABELS, formatSalary, placeLabel, summary } from "@/lib/vacancy";
import { getVacancy } from "@/services/publicVacancies.service";
import type { Vacancy } from "@/types";

type Loaded = { kind: "found"; vacancy: Vacancy; now: number } | { kind: "missing" } | { kind: "failed" };

async function load(id: string): Promise<Loaded> {
  let vacancy: Vacancy | null;
  try {
    vacancy = await getVacancy(id);
  } catch {
    return { kind: "failed" };
  }
  if (!vacancy) return { kind: "missing" };
  await connection();
  return { kind: "found", vacancy, now: Date.now() };
}

function metaDescription(vacancy: Vacancy): string {
  const salary = formatSalary(vacancy) ?? "Salary not specified";
  const facts = `${placeLabel(vacancy)} · ${EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]} · ${salary}.`;
  return summary(`${facts} ${vacancy.description}`);
}

export async function generateMetadata({ params }: PageProps<"/vacancies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") return { title: "Vacancy not found", robots: { index: false } };
  if (loaded.kind === "failed") return { title: "Vacancy" };
  const { vacancy } = loaded;
  const description = metaDescription(vacancy);
  const photo = vacancy.photos[0];
  return {
    title: vacancy.title,
    description,
    robots: { index: vacancy.status === "published", follow: true },
    openGraph: {
      type: "website",
      siteName: "DreamJob",
      locale: "en_GB",
      title: vacancy.title,
      description,
      images: photo ? [{ url: photo.url, alt: vacancy.title }] : undefined,
    },
    twitter: {
      card: photo ? "summary_large_image" : "summary",
      title: vacancy.title,
      description,
    },
  };
}

export default async function VacancyPage({ params }: PageProps<"/vacancies/[id]">) {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") notFound();
  if (loaded.kind === "failed") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ResultsError
          title="This vacancy didn't load"
          body="We couldn't reach DreamJob just now. Check your connection, then try again."
        />
      </div>
    );
  }

  const { vacancy, now } = loaded;
  return <VacancyDetailView vacancy={vacancy} now={now} back={{ href: routes.vacancies, label: "All vacancies" }} />;
}
