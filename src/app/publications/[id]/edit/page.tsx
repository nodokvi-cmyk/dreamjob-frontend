import type { Metadata } from "next";
import { Suspense } from "react";
import { UserRoute } from "@/components/guards/UserRoute";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { FormPageSkeleton } from "@/components/publications/FormPage";
import { EditPublicationScreen } from "./EditPublicationScreen";

export const metadata: Metadata = { title: "Edit publication", robots: { index: false } };

async function EditLoader({ params }: Pick<PageProps<"/publications/[id]/edit">, "params">) {
  const { id } = await params;
  return (
    <UserRoute>
      <EditPublicationScreen id={id} />
    </UserRoute>
  );
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
