import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ResultsError } from "@/components/vacancies/ListStates";
import { ApplyPanel } from "@/components/vacancies/apply/ApplyPanel";
import { DetailActions } from "@/components/vacancies/DetailActions";
import { SimilarVacancies } from "@/components/vacancies/SimilarVacancies";
import { OwnerStrip } from "@/components/vacancies/OwnerStrip";
import { VacancyDetailView } from "@/components/vacancies/VacancyDetail";
import { ViewerMarksProvider } from "@/components/vacancies/ViewerMarks";
import { jobPostingJson } from "@/lib/jobPosting";
import { companyHref, routes } from "@/lib/routes";
import { canonicalFor, openGraphFor } from "@/lib/site";
import { EMPLOYMENT_TYPE_LABELS, NEGOTIABLE, formatSalary, placeLabel, summary } from "@/lib/vacancy";
import { getVacancy } from "@/services/publicVacancies.service";
import type { VacancyDetail } from "@/types";

type Loaded = { kind: "found"; vacancy: VacancyDetail; now: number } | { kind: "missing" } | { kind: "failed" };

async function load(id: string): Promise<Loaded> {
  let vacancy: VacancyDetail | null;
  try {
    vacancy = await getVacancy(id);
  } catch {
    return { kind: "failed" };
  }
  if (!vacancy) return { kind: "missing" };
  await connection();
  return { kind: "found", vacancy, now: Date.now() };
}

function metaDescription(vacancy: VacancyDetail): string {
  const salary = formatSalary(vacancy) ?? NEGOTIABLE;
  const facts = `${placeLabel(vacancy)} · ${EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]} · ${salary}.`;
  return summary(`${facts} ${vacancy.description}`);
}

export async function generateMetadata({ params }: PageProps<"/vacancies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const loaded = await load(id);
  if (loaded.kind === "missing") {
    return {
      title: "Vacancy not found",
      robots: { index: false },
      openGraph: openGraphFor(`/vacancies/${encodeURIComponent(id)}`, { title: "Vacancy not found" }),
    };
  }
  if (loaded.kind === "failed") {
    return { title: "Vacancy", openGraph: openGraphFor(`/vacancies/${encodeURIComponent(id)}`, { title: "Vacancy" }) };
  }
  const { vacancy } = loaded;
  const description = metaDescription(vacancy);
  const photo = vacancy.photos[0];
  return {
    title: vacancy.title,
    description,
    robots: { index: vacancy.status === "published", follow: true },
    alternates: canonicalFor(`/vacancies/${vacancy.id}`),
    openGraph: openGraphFor(`/vacancies/${vacancy.id}`, {
      title: vacancy.title,
      description,
      images: [
        photo
          ? { url: photo.url, alt: vacancy.title }
          : { url: `/og/vacancy/${vacancy.id}`, width: 1200, height: 630, alt: vacancy.title },
      ],
    }),
    twitter: {
      card: "summary_large_image",
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
          body="We couldn't reach GetDreamJob just now. Check your connection, then try again."
        />
      </div>
    );
  }

  const { vacancy, now } = loaded;
  const jsonLd = jobPostingJson(vacancy);
  return (
    <>
    <ViewerMarksProvider source={{ kind: "detail", id: vacancy.id }}>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
      <OwnerStrip vacancyId={vacancy.id} companyId={vacancy.company} />
      <VacancyDetailView
        vacancy={vacancy}
        now={now}
        back={{ href: routes.vacancies, label: "All vacancies" }}
        employer={{
          companyName: vacancy.companyName,
          logoUrl: vacancy.logoUrl,
          approved: vacancy.companyApproved,
          href: companyHref(vacancy.company),
          rating: vacancy.rating,
        }}
        actions={<DetailActions vacancy={vacancy} now={now} />}
        apply={<ApplyPanel vacancy={vacancy} now={now} />}
      />
    </ViewerMarksProvider>
    <SimilarVacancies id={vacancy.id} category={vacancy.category} now={now} />
    </>
  );
}
