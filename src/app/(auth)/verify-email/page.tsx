import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { VerifyEmailScreen } from "./VerifyEmailScreen";

export const metadata: Metadata = { title: "Confirm your email" };

export default function VerifyEmailPage() {
  return (
    <FreshOnReturn>
      <VerifyEmailScreen />
    </FreshOnReturn>
  );
}
