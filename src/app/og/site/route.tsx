import { brandCard } from "@/lib/ogCard";

export function GET() {
  return brandCard({
    eyebrow: "Jobs in Georgia",
    title: "Find the job you have been waiting for",
    lines: ["Reviewed vacancies with pay and deadline"],
  });
}
