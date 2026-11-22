import { brandCard } from "@/lib/ogCard";
import { getPublicUserCard } from "@/services/publicUsers.service";

export async function GET(_request: Request, { params }: RouteContext<"/og/user/[id]">) {
  const { id } = await params;
  const user = await getPublicUserCard(id);
  if (!user) return brandCard({ eyebrow: "Profile", title: "Profile on GetDreamJob" });
  return brandCard({
    eyebrow: "Job seeker",
    title: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Job seeker",
  });
}
