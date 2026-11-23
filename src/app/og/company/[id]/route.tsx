import { brandCard } from "@/lib/ogCard";
import { formatRating } from "@/lib/rating";
import { getPublicCompany } from "@/services/publicCompanies.service";

export async function GET(_request: Request, { params }: RouteContext<"/og/company/[id]">) {
  const { id } = await params;
  const company = await getPublicCompany(id).catch(() => null);
  if (!company) return brandCard({ eyebrow: "Company", title: "Company on GetDreamJob" });
  const lines = [
    company.location,
    company.rating === null ? "" : `${formatRating(company.rating)} out of 5`,
  ].filter(Boolean);
  return brandCard({ eyebrow: "Company", title: company.companyName.trim() || "Company", lines });
}
