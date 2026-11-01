import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <FreshOnReturn>
      <ForgotPasswordScreen />
    </FreshOnReturn>
  );
}
