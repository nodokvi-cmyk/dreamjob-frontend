"use client";

import { useState } from "react";
import { CompanyStanding } from "@/components/dashboard/CompanyStanding";
import { EditorFrame } from "@/components/dashboard/OwnerStates";
import { VacancyForm } from "@/components/dashboard/VacancyForm";
import { GateSpinner } from "@/components/guards/GateStates";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/lib/routes";
import type { CurrentCompany } from "@/types";

export function NewVacancyScreen() {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <NewVacancy account={session.account} />;
}

function NewVacancy({ account }: { account: CurrentCompany }) {
  const [now] = useState(() => Date.now());
  return (
    <EditorFrame
      title="Post a vacancy"
      lead="Fill in the role, pay and closing date. Our team reviews it, then it goes live for seekers."
      back={{ href: routes.dashboard, label: "Dashboard" }}
      status="draft"
    >
      <div className="flex flex-col gap-8 pt-8">
        <CompanyStanding account={account} />
        <VacancyForm account={account} now={now} />
      </div>
    </EditorFrame>
  );
}
