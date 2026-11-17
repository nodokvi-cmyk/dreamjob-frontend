import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { PublicationSkeleton } from "@/components/publications/PublicationView";
import { PublicationScreen } from "./PublicationScreen";

export const metadata: Metadata = { title: "Publication", robots: { index: false } };

async function PublicationLoader({ params }: Pick<PageProps<"/publications/[id]">, "params">) {
  const { id } = await params;
  return <PublicationScreen id={id} />;
}

export default function PublicationPage({ params }: PageProps<"/publications/[id]">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<PublicationSkeleton />}>
        <PublicationLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
