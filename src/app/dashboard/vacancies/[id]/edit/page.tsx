import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorSkeleton } from "@/components/dashboard/OwnerStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { EditVacancyScreen } from "./EditVacancyScreen";

export const metadata: Metadata = { title: "Edit vacancy", robots: { index: false } };

async function EditLoader({ params }: Pick<PageProps<"/dashboard/vacancies/[id]/edit">, "params">) {
  const { id } = await params;
  return <EditVacancyScreen id={id} />;
}

export default function EditVacancyPage({ params }: PageProps<"/dashboard/vacancies/[id]/edit">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<EditorSkeleton />}>
        <EditLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
