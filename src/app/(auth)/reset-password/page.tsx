import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { ResetPasswordScreen } from "./ResetPasswordScreen";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <FreshOnReturn>
      <ResetPasswordScreen />
    </FreshOnReturn>
  );
}
