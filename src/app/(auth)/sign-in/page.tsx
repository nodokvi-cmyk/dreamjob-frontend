import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { SignInScreen } from "./SignInScreen";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <FreshOnReturn>
      <SignInScreen />
    </FreshOnReturn>
  );
}
