import { brandCard } from "@/lib/ogCard";
import { formatRating } from "@/lib/rating";
import { getPublicCompany } from "@/services/publicCompanies.service";

export async function GET(_request: Request, { params }: RouteContext<"/og/company/[id]">) {
  const { id } = await params;
  try {
    const company = await getPublicCompany(id);
    if (company) {
      const lines = [
        company.location,
        company.rating === null ? "" : `${formatRating(company.rating)} out of 5`,
      ].filter(Boolean);
      return brandCard({ eyebrow: "Company", title: company.companyName.trim() || "Company", lines });
    }
  } catch {
    return brandCard({ eyebrow: "Company", title: "Company on GetDreamJob" });
  }
  return new Response("Not found", { status: 404 });
}
