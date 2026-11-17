import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { PublicationSkeleton } from "@/components/publications/PublicationView";
import { AdminPublicationReviewScreen } from "./AdminPublicationReviewScreen";

export const metadata: Metadata = { title: "Review publication", robots: { index: false } };

async function ReviewLoader({ params }: Pick<PageProps<"/admin/publications/[id]">, "params">) {
  const { id } = await params;
  return <AdminPublicationReviewScreen id={id} />;
}

export default function AdminPublicationReviewPage({ params }: PageProps<"/admin/publications/[id]">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={<PublicationSkeleton />}>
        <ReviewLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
