import type { Metadata } from "next";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { SignUpScreen } from "./SignUpScreen";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <FreshOnReturn>
      <SignUpScreen />
    </FreshOnReturn>
  );
}
