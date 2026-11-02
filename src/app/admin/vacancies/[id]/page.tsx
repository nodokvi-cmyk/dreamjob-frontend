import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { VacancyDetailSkeleton } from "@/components/vacancies/VacancyDetail";
import { AdminReviewScreen } from "./AdminReviewScreen";

export const metadata: Metadata = { title: "Review vacancy", robots: { index: false } };

async function ReviewLoader({ params }: Pick<PageProps<"/admin/vacancies/[id]">, "params">) {
  const { id } = await params;
  return <AdminReviewScreen id={id} />;
}

export default function AdminReviewPage({ params }: PageProps<"/admin/vacancies/[id]">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<VacancyDetailSkeleton />}>
        <ReviewLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
