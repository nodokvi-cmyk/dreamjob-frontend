import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { FormPageSkeleton } from "@/components/publications/FormPage";
import { EditPublicationScreen } from "./EditPublicationScreen";

export const metadata: Metadata = { title: "Edit publication", robots: { index: false } };

async function EditLoader({ params }: Pick<PageProps<"/publications/[id]/edit">, "params">) {
  const { id } = await params;
  return <EditPublicationScreen id={id} />;
}

export default function EditPublicationPage({ params }: PageProps<"/publications/[id]/edit">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<FormPageSkeleton />}>
        <EditLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
