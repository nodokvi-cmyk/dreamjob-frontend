import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { VacancyDetailSkeleton } from "@/components/vacancies/VacancyDetail";
import { OwnerPreviewScreen } from "./OwnerPreviewScreen";

export const metadata: Metadata = { title: "Vacancy preview", robots: { index: false } };

async function PreviewLoader({ params }: Pick<PageProps<"/dashboard/vacancies/[id]">, "params">) {
  const { id } = await params;
  return <OwnerPreviewScreen id={id} />;
}

export default function OwnerPreviewPage({ params }: PageProps<"/dashboard/vacancies/[id]">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<VacancyDetailSkeleton />}>
        <PreviewLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
