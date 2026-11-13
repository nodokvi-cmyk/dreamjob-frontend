import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { PublicUserScreen } from "./PublicUserScreen";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

async function ProfileLoader({ params }: Pick<PageProps<"/users/[id]">, "params">) {
  const { id } = await params;
  return <PublicUserScreen id={id} />;
}

export default function PublicUserPage({ params }: PageProps<"/users/[id]">) {
  return (
    <FreshOnReturn>
      <Suspense fallback={null}>
        <ProfileLoader params={params} />
      </Suspense>
    </FreshOnReturn>
  );
}
