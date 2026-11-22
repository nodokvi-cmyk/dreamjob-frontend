import { brandCard } from "@/lib/ogCard";
import { NEGOTIABLE, formatSalary, placeLabel } from "@/lib/vacancy";
import { getVacancy } from "@/services/publicVacancies.service";

export async function GET(_request: Request, { params }: RouteContext<"/og/vacancy/[id]">) {
  const { id } = await params;
  try {
    const vacancy = await getVacancy(id);
    if (vacancy) {
      return brandCard({
        eyebrow: vacancy.companyName || "Vacancy",
        title: vacancy.title,
        lines: [placeLabel(vacancy), formatSalary(vacancy) ?? NEGOTIABLE],
      });
    }
  } catch {
    return brandCard({ eyebrow: "Vacancy", title: "Open vacancy on GetDreamJob" });
  }
  return new Response("Not found", { status: 404 });
}
