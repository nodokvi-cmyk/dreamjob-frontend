"use client";

import { ExternalLinkIcon, FileTextIcon, FileUpIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { Notice } from "@/components/profile/SaveRow";
import { ToggleRow } from "@/components/profile/ToggleRow";
import { useAction } from "@/components/profile/useAction";
import { usePickedFile } from "@/components/profile/usePickedFile";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formError, problem } from "@/lib/errors";
import { formatBytes, MAX_UPLOAD_LABEL, PDF_ACCEPT, pdfProblem } from "@/lib/files";
import { cn } from "@/lib/utils";
import { getCvLink, removeCv, setCvVisibility, uploadCv } from "@/services/users.service";
import type { CurrentUser } from "@/types";

const BLOCKED = "Your browser blocked the new tab. Allow pop-ups for GetDreamJob, then try again.";

export function CvPanel({ accountId, account }: { accountId: string; account: CurrentUser }) {
  const { refresh } = useAuth();
  const file = useAction();
  const visibility = useAction();
  const { picked, pick } = usePickedFile();
  const [opening, setOpening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = file.pending || opening;

  function handleChoose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!chosen) return;
    const issue = pdfProblem(chosen);
    if (issue) {
      pick(null);
      file.fail(problem(issue));
      return;
    }
    file.reset();
    pick(chosen);
  }

  async function handleUpload() {
    if (!picked) return;
    const chosen = picked.file;
    const replacing = account.hasCv;
    await file.run(async () => {
      await uploadCv(accountId, chosen);
      await refresh();
      pick(null);
      return replacing ? "CV replaced." : "CV uploaded.";
    });
  }

  async function handleRemove() {
    await file.run(async () => {
      await removeCv(accountId);
      await refresh();
      return "CV removed. It's hidden from companies.";
    });
  }

  async function handleView() {
    const tab = window.open("", "_blank");
    if (!tab) {
      file.fail(problem(BLOCKED));
      return;
    }
    tab.opener = null;
    setOpening(true);
    file.reset();
    try {
      const { url } = await getCvLink(accountId);
      tab.location.href = url;
    } catch (reason: unknown) {
      tab.close();
      file.fail(formError(reason));
    } finally {
      setOpening(false);
    }
  }

  async function handleVisibility() {
    const next = !account.isCvPublic;
    await visibility.run(async () => {
      await setCvVisibility(accountId, next);
      await refresh();
      return next ? "Approved companies can now see your CV." : "Your CV is now private.";
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-[17px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
          <span
            aria-hidden
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-[12px]",
              picked ? "bg-line-cobalt/12 text-cobalt-ink" : account.hasCv ? "bg-enamel text-on-enamel" : "bg-muted text-muted-foreground",
            )}
          >
            <FileTextIcon className="size-6" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            {picked ? (
              <>
                <p className="font-semibold">Ready to upload, not saved yet</p>
                <p className="tabular break-all text-muted-foreground">
                  {picked.file.name} · {formatBytes(picked.file.size)}
                </p>
              </>
            ) : account.hasCv ? (
              <>
                <p className="font-semibold">Your CV is on file</p>
                <p className="text-muted-foreground">PDF. Upload a new one any time to replace it.</p>
              </>
            ) : (
              <>
                <p className="font-semibold">No CV yet</p>
                <p className="text-muted-foreground">One PDF, up to {MAX_UPLOAD_LABEL}.</p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {picked ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <a href={picked.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon aria-hidden />
                    Preview
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
                <Button type="button" size="sm" onClick={handleUpload} disabled={busy}>
                  <UploadIcon aria-hidden />
                  {file.pending ? "Uploading" : "Upload CV"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => pick(null)} disabled={busy}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {account.hasCv ? (
                  <Button type="button" variant="outline" size="sm" onClick={handleView} disabled={busy}>
                    <ExternalLinkIcon aria-hidden />
                    {opening ? "Opening" : "View CV"}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={account.hasCv ? "outline" : "default"}
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                >
                  <FileUpIcon aria-hidden />
                  {account.hasCv ? "Replace" : "Choose PDF"}
                </Button>
                {account.hasCv ? (
                  <Button type="button" variant="destructive" size="sm" onClick={handleRemove} disabled={busy}>
                    <Trash2Icon aria-hidden />
                    {file.pending ? "Working" : "Remove"}
                  </Button>
                ) : null}
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={PDF_ACCEPT}
            onChange={handleChoose}
            tabIndex={-1}
            aria-hidden
            className="sr-only"
          />
        </div>
        <Notice message={file.notice} />
        {file.error ? <FormAlert tone="error" message={file.error.message} details={file.error.details} /> : null}
      </div>

      <ToggleRow
        label="Show my CV to approved companies"
        hint={
          account.hasCv
            ? "When this is on and your profile is public, companies our team has approved can open your CV. Turn it off at any time."
            : "Upload a CV first. When it's public and your profile is public, companies our team has approved can open it."
        }
        checked={account.isCvPublic}
        disabled={!account.hasCv || visibility.pending}
        onToggle={handleVisibility}
        onLabel="Public to approved companies"
        offLabel="Private"
        notice={visibility.notice}
        error={visibility.error}
      />
    </div>
  );
}
