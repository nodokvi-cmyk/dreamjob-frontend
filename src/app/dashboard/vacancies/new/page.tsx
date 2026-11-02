import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { NewVacancyScreen } from "./NewVacancyScreen";

export const metadata: Metadata = { title: "Post a vacancy", robots: { index: false } };

export default function NewVacancyPage() {
  return (
    <FreshOnReturn>
      <NewVacancyScreen />
    </FreshOnReturn>
  );
}
