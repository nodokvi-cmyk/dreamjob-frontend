import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { ApplicantsScreen } from "./ApplicantsScreen";

export const metadata: Metadata = { title: "Applicants", robots: { index: false } };

async function ApplicantsLoader({ params }: Pick<PageProps<"/dashboard/vacancies/[id]/applicants">, "params">) {
  const { id } = await params;
  return <ApplicantsScreen id={id} />;
}

export default function ApplicantsPage({ params }: PageProps<"/dashboard/vacancies/[id]/applicants">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading applicants" />}>
        <ApplicantsLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
