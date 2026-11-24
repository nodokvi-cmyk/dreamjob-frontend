"use client";

import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { APPLY_TONE, type ApplyKind } from "@/components/vacancies/ApplyButton";
import { MessageField } from "@/components/vacancies/apply/MessageField";
import { PdfPicker } from "@/components/vacancies/apply/PdfPicker";
import { useApply } from "@/components/vacancies/apply/useApply";
import { usePreviousApplication } from "@/components/vacancies/apply/usePreviousApplication";
import {
  APPLICATION_FILE_LABEL,
  MESSAGE_MAX_WORDS,
  PRIVACY_NOTE,
  REPEAT_WARNING,
  countWords,
  repeatsPrevious,
} from "@/lib/applications";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, ApplyInput } from "@/types";

type CvSource = "profile" | "upload" | "none";

interface ApplyFormProps {
  vacancy: { id: string; title: string };
  kind: ApplyKind;
  previousStatus: ApplicationStatus | null;
  hasProfileCv: boolean;
  onSent: () => void;
}

interface Errors {
  message?: string;
  cv?: string;
  coverLetter?: string;
}

export function ApplyForm({ vacancy, kind, previousStatus, hasProfileCv, onSent }: ApplyFormProps) {
  const afterReject = kind === "reapply" && previousStatus === "rejected";
  const { previous, loading } = usePreviousApplication(vacancy.id, vacancy.title, afterReject);
  const { pending, error, send } = useApply(vacancy.id);
  const [message, setMessage] = useState("");
  const [cvSource, setCvSource] = useState<CvSource>(hasProfileCv ? "profile" : "none");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letter, setLetter] = useState<File | null>(null);
  const [keepPrevious, setKeepPrevious] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [repeatOpen, setRepeatOpen] = useState(false);

  const keep = afterReject && keepPrevious;
  const newCv = cvSource === "profile" || (cvSource === "upload" && cvFile !== null);
  const newMessage = message.trim() !== "";
  const keptCv = keep && !newCv && (previous?.hasCv ?? false);
  const keptLetter = keep && letter === null && (previous?.hasCoverLetter ?? false);
  const keptMessage = keep && !newMessage && (previous?.message.trim() ?? "") !== "";
  const sendsCv = newCv || keptCv;
  const sendsLetter = letter !== null || keptLetter;
  const sendsMessage = newMessage || keptMessage;
  const missing = [
    sendsCv ? null : "CV",
    sendsLetter ? null : "cover letter",
    sendsMessage ? null : "message",
  ].filter((item): item is string => item !== null);
  const reapply = kind === "reapply";

  function validate(): Errors {
    const next: Errors = {};
    if (countWords(message) > MESSAGE_MAX_WORDS) next.message = `Keep the message to ${MESSAGE_MAX_WORDS} words or fewer.`;
    if (cvSource === "upload" && !cvFile) next.cv = "Choose a PDF, or pick another CV option.";
    return next;
  }

  function input(): ApplyInput {
    return {
      message: newMessage ? message : undefined,
      useProfileCv: cvSource === "profile" ? true : undefined,
      cv: cvSource === "upload" && cvFile ? cvFile : undefined,
      coverLetter: letter ?? undefined,
      keepPrevious: afterReject ? keepPrevious : undefined,
    };
  }

  async function submit() {
    if (await send(input())) onSent();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors((current) => ({ ...found, coverLetter: current.coverLetter }));
    if (found.message || found.cv) return;
    const repeat =
      afterReject &&
      repeatsPrevious({ message, newCv, newCoverLetter: letter !== null, keepPrevious }, previous);
    if (repeat) {
      setRepeatOpen(true);
      return;
    }
    await submit();
  }

  const keepOption = keep && (previous?.hasCv ?? false);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-7">
      {reapply ? (
        <FormAlert
          tone="info"
          message={
            previousStatus === "rejected"
              ? "This is a reapply after the employer rejected your application."
              : "This is a reapply after you withdrew your application."
          }
        >
          <p className="text-muted-foreground">You have no attempts left after it.</p>
        </FormAlert>
      ) : null}

      <MessageField value={message} onChange={setMessage} error={errors.message} disabled={pending} />

      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-1 text-sm font-medium">
          CV <span className="font-normal text-muted-foreground">Optional, one source</span>
        </legend>
        <CvOption
          checked={cvSource === "profile"}
          disabled={!hasProfileCv}
          onSelect={() => setCvSource("profile")}
          label="My profile CV"
          hint={
            hasProfileCv ? (
              "We attach a copy of the CV on your profile."
            ) : (
              <>
                You have no profile CV.{" "}
                <Link href={`${routes.profile}#cv`} className="font-medium text-cobalt-ink underline-offset-4 hover:underline">
                  Add one on your profile
                </Link>
              </>
            )
          }
        />
        <CvOption
          checked={cvSource === "upload"}
          onSelect={() => setCvSource("upload")}
          label="Upload a PDF"
          hint={`For this application only, up to ${APPLICATION_FILE_LABEL}.`}
        >
          {cvSource === "upload" ? (
            <PdfPicker
              label="Choose CV"
              file={cvFile}
              error={errors.cv}
              disabled={pending}
              onPick={(file, problem) => {
                setCvFile(file);
                setErrors((current) => ({ ...current, cv: problem ?? undefined }));
              }}
            />
          ) : null}
        </CvOption>
        <CvOption
          checked={cvSource === "none"}
          onSelect={() => setCvSource("none")}
          label={keepOption ? "Keep the CV I sent before" : "No CV"}
        />
      </fieldset>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          Cover letter <span className="font-normal text-muted-foreground">Optional, PDF up to {APPLICATION_FILE_LABEL}</span>
        </p>
        <PdfPicker
          label="Choose cover letter"
          file={letter}
          error={errors.coverLetter}
          disabled={pending}
          onPick={(file, problem) => {
            setLetter(file);
            setErrors((current) => ({ ...current, coverLetter: problem ?? undefined }));
          }}
        />
        {keptLetter ? <p className="text-sm text-muted-foreground">Your earlier cover letter is kept.</p> : null}
      </div>

      {afterReject ? (
        <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3.5">
          <input
            type="checkbox"
            checked={keepPrevious}
            disabled={pending}
            onChange={(event) => setKeepPrevious(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="font-medium">Keep what I sent before</span>
            <span className="text-sm text-muted-foreground">
              {loading
                ? "Checking your earlier application..."
                : previous
                  ? `Anything you don't send again stays: ${describe(previous)}.`
                  : "Anything you don't send again stays as it was in your earlier application."}
            </span>
          </span>
        </label>
      ) : null}

      {missing.length > 0 ? (
        <FormAlert tone="attention" message={`You are sending no ${joinList(missing, "or")}.`}>
          <p className="text-muted-foreground">You can still send it. Employers decide faster with more to go on.</p>
        </FormAlert>
      ) : null}

      <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <ShieldAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-line-amber" />
        {PRIVACY_NOTE}
      </p>

      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}

      <Button type="submit" size="lg" disabled={pending} aria-disabled={pending} className={cn("w-full sm:w-fit", APPLY_TONE[kind])}>
        {pending ? "Sending..." : reapply ? "Send reapplication" : "Send application"}
      </Button>

      <ConfirmDialog
        open={repeatOpen}
        onOpenChange={setRepeatOpen}
        title="Send the same application again?"
        description={REPEAT_WARNING}
        confirmLabel="Send anyway"
        pendingLabel="Sending..."
        cancelLabel="Go back"
        onConfirm={submit}
      />
    </form>
  );
}

function describe(previous: { message: string; hasCv: boolean; hasCoverLetter: boolean }): string {
  const parts = [
    previous.message.trim() ? "your message" : null,
    previous.hasCv ? "your CV" : null,
    previous.hasCoverLetter ? "your cover letter" : null,
  ].filter((part): part is string => part !== null);
  if (parts.length === 0) return "nothing, your earlier application was empty";
  return joinList(parts, "and");
}

function joinList(parts: string[], word: "and" | "or"): string {
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} ${word} ${parts[parts.length - 1]}`;
}

interface CvOptionProps {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  label: string;
  hint?: ReactNode;
  children?: ReactNode;
}

function CvOption({ checked, disabled, onSelect, label, hint, children }: CvOptionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3.5 transition-colors",
        checked ? "border-foreground/40 bg-card" : "border-border",
      )}
    >
      <label className={cn("flex items-start gap-3", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        <input
          type="radio"
          name="cv-source"
          checked={checked}
          disabled={disabled}
          onChange={onSelect}
          className="mt-1 size-4 shrink-0 accent-primary"
        />
        <span className="flex flex-col gap-1">
          <span className={cn("font-medium", disabled && "text-muted-foreground")}>{label}</span>
          {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
        </span>
      </label>
      {children ? <div className="pl-7">{children}</div> : null}
    </div>
  );
}
