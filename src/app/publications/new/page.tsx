import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { NewPublicationScreen } from "./NewPublicationScreen";

export const metadata: Metadata = { title: "New publication", robots: { index: false } };

export default function NewPublicationPage() {
  return (
    <FreshOnReturn>
      <NewPublicationScreen />
    </FreshOnReturn>
  );
}
