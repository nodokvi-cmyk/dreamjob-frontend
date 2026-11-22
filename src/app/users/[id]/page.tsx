import type { Metadata } from "next";
import { Suspense } from "react";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { openGraphFor } from "@/lib/site";
import { getPublicUserCard } from "@/services/publicUsers.service";
import { PublicUserScreen } from "./PublicUserScreen";

export async function generateMetadata({ params }: PageProps<"/users/[id]">): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicUserCard(id);
  if (!user || user.isPrivate) return { title: "Profile", robots: { index: false } };
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Profile";
  return {
    title: name,
    robots: { index: false },
    openGraph: openGraphFor(`/users/${user.id}`, {
      title: name,
      description: `${name} on GetDreamJob.`,
      images: [
        user.avatarUrl
          ? { url: user.avatarUrl, alt: name }
          : { url: `/og/user/${user.id}`, width: 1200, height: 630, alt: name },
      ],
    }),
  };
}

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
