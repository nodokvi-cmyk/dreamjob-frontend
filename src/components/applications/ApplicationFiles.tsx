"use client";

import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formError } from "@/lib/errors";
import { openInNewTab } from "@/lib/openLink";
import { getApplicationCoverLetter, getApplicationCv } from "@/services/applications.service";
import type { CvLink } from "@/types";

interface FileButtonsProps {
  hasCv: boolean;
  hasCoverLetter: boolean;
  loadCv: () => Promise<CvLink>;
  loadCoverLetter: () => Promise<CvLink>;
  onError: (message: string | null) => void;
}

export function FileButtons({ hasCv, hasCoverLetter, loadCv, loadCoverLetter, onError }: FileButtonsProps) {
  const [opening, setOpening] = useState<"cv" | "letter" | null>(null);

  async function open(kind: "cv" | "letter") {
    setOpening(kind);
    onError(null);
    try {
      await openInNewTab(kind === "cv" ? loadCv : loadCoverLetter);
    } catch (error: unknown) {
      onError(formError(error).message);
    } finally {
      setOpening(null);
    }
  }

  if (!hasCv && !hasCoverLetter) return null;
  return (
    <>
      {hasCv ? (
        <Button type="button" variant="outline" size="sm" disabled={opening !== null} onClick={() => open("cv")}>
          <FileTextIcon aria-hidden />
          {opening === "cv" ? "Opening" : "CV"}
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
      ) : null}
      {hasCoverLetter ? (
        <Button type="button" variant="outline" size="sm" disabled={opening !== null} onClick={() => open("letter")}>
          <FileTextIcon aria-hidden />
          {opening === "letter" ? "Opening" : "Cover letter"}
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
      ) : null}
    </>
  );
}

interface ApplicationFilesProps {
  applicationId: string;
  hasCv: boolean;
  hasCoverLetter: boolean;
  onError: (message: string | null) => void;
}

export function ApplicationFiles({ applicationId, hasCv, hasCoverLetter, onError }: ApplicationFilesProps) {
  return (
    <FileButtons
      hasCv={hasCv}
      hasCoverLetter={hasCoverLetter}
      loadCv={() => getApplicationCv(applicationId)}
      loadCoverLetter={() => getApplicationCoverLetter(applicationId)}
      onError={onError}
    />
  );
}
