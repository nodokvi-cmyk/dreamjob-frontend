"use client";

import { ArrowRightIcon, FileTextIcon, RotateCwIcon, Undo2Icon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { ListField } from "@/components/form/ListField";
import { FieldFrame, TextAreaField, TextField, describedBy } from "@/components/form/TextField";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Salary } from "@/components/vacancies/Salary";
import { useAuth } from "@/context/AuthContext";
import { APPLICATION_FILE_LABEL, applicationPdfProblem, countWords } from "@/lib/applications";
import { CATEGORIES } from "@/lib/categories";
import { formError, isUserGone } from "@/lib/errors";
import { formatBytes, PDF_ACCEPT } from "@/lib/files";
import { openInNewTab } from "@/lib/openLink";
import {
  emptyPublicationDraft,
  publicationDraftFrom,
  toPublicationInput,
  toPublicationUpdate,
  validatePublicationDraft,
  type PublicationDraft,
  type PublicationField,
} from "@/lib/publicationForm";
import { CONTACT_NOTE, PUBLICATION_LIMITS, REVIEW_NOTE, editNeedsReview } from "@/lib/publications";
import { publicationHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { CURRENCIES, EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES, WORK_MODE_LABELS, WORK_MODES } from "@/lib/vacancy";
import { OTHER_CATEGORY, parseAmount } from "@/lib/vacancyForm";
import {
  createPublication,
  getPublicationFile,
  removePublicationFile,
  updatePublication,
  uploadPublicationFile,
  type PublicationFileKind,
} from "@/services/publications.service";
import type { Publication } from "@/types";

type Phase = "editing" | "saving" | "files";

type UploadState = "idle" | "uploading" | "done" | "failed";

interface Slot {
  file: File | null;
  remove: boolean;
  state: UploadState;
  error: string | null;
  pickError: string | null;
}

const KINDS: readonly PublicationFileKind[] = ["cv", "coverLetter"];

const FILE_LABEL: Record<PublicationFileKind, string> = { cv: "CV", coverLetter: "Cover letter" };

const EMPTY_SLOT: Slot = { file: null, remove: false, state: "idle", error: null, pickError: null };

const FILE_TOO_BIG = { 413: `Each file can be at most ${APPLICATION_FILE_LABEL}.` };

function failureMessage(kinds: PublicationFileKind[]): string {
  const names = kinds.map((kind) => FILE_LABEL[kind]);
  const joined = names.length === 2 ? "CV and cover letter" : names[0];
  return `Publication saved, ${joined} upload failed, try again.`;
}

export function PublicationForm({ publication }: { publication?: Publication }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const id = useId();
  const creating = publication === undefined;
  const [base, setBase] = useState<Publication | undefined>(publication);
  const [draft, setDraft] = useState<PublicationDraft>(() =>
    publication ? publicationDraftFrom(publication) : emptyPublicationDraft(),
  );
  const [touched, setTouched] = useState<ReadonlySet<PublicationField>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>("editing");
  const [slots, setSlots] = useState<Record<PublicationFileKind, Slot>>({ cv: EMPTY_SLOT, coverLetter: EMPTY_SLOT });
  const { error, notice, fail, succeed, reset } = useAction();
  const alive = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const errors = validatePublicationDraft(draft);
  const locked = phase !== "editing";
  const shown = (field: PublicationField) => (submitted || touched.has(field) ? errors[field] : undefined);
  const set = <K extends PublicationField>(field: K, value: PublicationDraft[K]) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const blur = (field: PublicationField) => () =>
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));
  const patchSlot = (kind: PublicationFileKind, patch: Partial<Slot>) =>
    setSlots((current) => ({ ...current, [kind]: { ...current[kind], ...patch } }));

  const hasFile = (kind: PublicationFileKind) => (kind === "cv" ? base?.hasCv : base?.hasCoverLetter) === true;
  const removals = KINDS.filter((kind) => slots[kind].remove && slots[kind].file === null && hasFile(kind));
  const uploads = KINDS.filter((kind) => slots[kind].file !== null && slots[kind].state !== "done");
  const failed = KINDS.filter((kind) => slots[kind].state === "failed");
  const uploading = KINDS.some((kind) => slots[kind].state === "uploading");

  function focusSoon(target: () => HTMLElement | null | undefined) {
    requestAnimationFrame(() => target()?.focus());
  }

  function handleFailure(reason: unknown) {
    if (isUserGone(reason)) {
      signOut();
      return;
    }
    fail(formError(reason, FILE_TOO_BIG));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    setSubmitted(true);
    reset();
    if (Object.keys(errors).length > 0) {
      focusSoon(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']"));
      return;
    }
    if (base && Object.keys(toPublicationUpdate(draft, base)).length === 0 && removals.length === 0 && uploads.length === 0) {
      succeed("Nothing changed.");
      return;
    }
    void save();
  }

  async function uploadOne(publicationId: string, kind: PublicationFileKind): Promise<boolean> {
    const file = slots[kind].file;
    if (!file) return true;
    patchSlot(kind, { state: "uploading", error: null });
    try {
      const next = await uploadPublicationFile(publicationId, kind, file);
      if (!alive.current) return false;
      setBase(next);
      patchSlot(kind, { state: "done" });
      return true;
    } catch (reason: unknown) {
      if (!alive.current) return false;
      if (isUserGone(reason)) signOut();
      patchSlot(kind, { state: "failed", error: formError(reason, FILE_TOO_BIG).message });
      return false;
    }
  }

  async function save() {
    setPhase("saving");
    reset();
    let publicationId: string;
    try {
      if (base) {
        publicationId = base.id;
        const input = toPublicationUpdate(draft, base);
        if (Object.keys(input).length > 0) setBase(await updatePublication(publicationId, input));
        for (const kind of removals) {
          setBase(await removePublicationFile(publicationId, kind));
          patchSlot(kind, { remove: false });
        }
      } else {
        const created = await createPublication(toPublicationInput(draft));
        publicationId = created.id;
        setBase(created);
      }
    } catch (reason: unknown) {
      if (!alive.current) return;
      setPhase("editing");
      handleFailure(reason);
      return;
    }

    let failures = 0;
    for (const kind of uploads) {
      if (!alive.current) return;
      const ok = await uploadOne(publicationId, kind);
      if (!ok) failures += 1;
    }
    if (!alive.current) return;
    if (failures === 0) {
      router.push(publicationHref(publicationId));
      return;
    }
    setPhase("files");
    focusSoon(() => reportRef.current);
  }

  async function retry(kind: PublicationFileKind) {
    if (!base || uploading) return;
    await uploadOne(base.id, kind);
  }

  function pick(kind: PublicationFileKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    const problem = applicationPdfProblem(file);
    if (problem) {
      patchSlot(kind, { pickError: problem });
      return;
    }
    patchSlot(kind, { file, remove: false, state: "idle", error: null, pickError: null });
  }

  function toggleList<T extends string>(list: readonly T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  const preview = {
    salaryMin: amountOf(draft.salaryMin),
    salaryMax: amountOf(draft.salaryMax),
    currency: draft.currency,
  };
  const aboutWords = countWords(draft.about);
  const reviewNote = base !== undefined && editNeedsReview(base);
  const doneHref = base ? publicationHref(base.id) : routes.publications;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-12">
      <FormAlert tone="info" message={CONTACT_NOTE} />
      <fieldset disabled={locked} className="flex min-w-0 flex-col gap-12">
        <ProfileSection id="basics" title="What you are looking for">
          <div className="flex flex-col gap-6">
            <TextField
              label="Title"
              name="title"
              autoComplete="off"
              maxLength={PUBLICATION_LIMITS.title}
              value={draft.title}
              onChange={(event) => set("title", event.target.value)}
              onBlur={blur("title")}
              error={shown("title")}
              hint="The job you want, for example Junior frontend developer."
              aside={
                <span aria-hidden className="text-xs text-muted-foreground tabular">
                  {draft.title.length} / {PUBLICATION_LIMITS.title}
                </span>
              }
            />
            <FieldFrame id={`${id}-category`} label="Category" error={shown("category")} className="sm:max-w-sm">
              <Select
                value={draft.category}
                onValueChange={(value) => {
                  set("category", value);
                  blur("category")();
                }}
              >
                <SelectTrigger
                  id={`${id}-category`}
                  className="w-full"
                  onBlur={blur("category")}
                  aria-invalid={shown("category") ? true : undefined}
                  aria-describedby={describedBy(`${id}-category`, null, shown("category"))}
                >
                  <SelectValue placeholder="Choose a category">
                    {draft.category === OTHER_CATEGORY ? "Other" : draft.category || "Choose a category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_CATEGORY}>Other</SelectItem>
                </SelectContent>
              </Select>
            </FieldFrame>
            {draft.category === OTHER_CATEGORY ? (
              <TextField
                label="Category name"
                value={draft.customCategory}
                maxLength={PUBLICATION_LIMITS.category}
                onChange={(event) => set("customCategory", event.target.value)}
                onBlur={blur("customCategory")}
                error={shown("customCategory")}
                hint="Name it the way companies would search for it."
                className="sm:max-w-sm"
              />
            ) : null}
            <ChoiceGroup
              legend="Work mode"
              options={WORK_MODES}
              labels={WORK_MODE_LABELS}
              selected={draft.workModes}
              onToggle={(mode) => set("workModes", toggleList(draft.workModes, mode))}
            />
            <ChoiceGroup
              legend="Contract"
              options={EMPLOYMENT_TYPES}
              labels={EMPLOYMENT_TYPE_LABELS}
              selected={draft.employmentTypes}
              onToggle={(type) => set("employmentTypes", toggleList(draft.employmentTypes, type))}
            />
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm leading-none font-semibold">
                Locations <span className="font-normal text-muted-foreground">Optional</span>
              </h2>
              <ListField
                items={draft.locations}
                error={shown("locations")}
                onChange={(items) => {
                  set("locations", items);
                  blur("locations")();
                }}
                max={PUBLICATION_LIMITS.locations}
                maxLength={PUBLICATION_LIMITS.location}
                hint="Cities or regions where you can work. Leave empty for any location."
                itemLabel="Location"
                addLabel="Add location"
                placeholder="For example: Tbilisi"
              />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection id="about" title="About you">
          <div className="flex flex-col gap-8">
            <TextAreaField
              label="About"
              name="about"
              rows={10}
              maxLength={PUBLICATION_LIMITS.about}
              value={draft.about}
              onChange={(event) => set("about", event.target.value)}
              onBlur={blur("about")}
              error={shown("about")}
              hint={
                <>
                  <span className={cn("tabular", aboutWords > PUBLICATION_LIMITS.aboutWords && "font-medium text-destructive")}>
                    {aboutWords} / {PUBLICATION_LIMITS.aboutWords} words.
                  </span>{" "}
                  Plain text, line breaks are kept. Your experience, what you do well and the job you want.
                </>
              }
            />
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm leading-none font-semibold">
                Skills <span className="font-normal text-muted-foreground">Optional</span>
              </h2>
              <ListField
                items={draft.skills}
                error={shown("skills")}
                onChange={(items) => {
                  set("skills", items);
                  blur("skills")();
                }}
                max={PUBLICATION_LIMITS.skills}
                maxLength={PUBLICATION_LIMITS.skill}
                hint="One skill per line. Companies search them."
                itemLabel="Skill"
                addLabel="Add skill"
                placeholder="For example: React"
              />
            </div>
            <TextField
              label="Years of experience"
              optional
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              value={draft.experienceYears}
              onChange={(event) => set("experienceYears", event.target.value.replace(/\D/g, ""))}
              onBlur={blur("experienceYears")}
              error={shown("experienceYears")}
              hint="Whole years, 0 to 60."
              className="sm:max-w-[12rem]"
            />
          </div>
        </ProfileSection>

        <ProfileSection id="pay" title="Desired pay" lead="Optional. For one amount, fill only the minimum.">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7.5rem]">
              <TextField
                label="Minimum"
                inputMode="decimal"
                autoComplete="off"
                maxLength={16}
                placeholder="Amount"
                value={draft.salaryMin}
                onChange={(event) => set("salaryMin", event.target.value.replace(/[^\d.,\s]/g, ""))}
                onBlur={blur("salaryMin")}
                error={shown("salaryMin")}
                className="min-w-0"
              />
              <TextField
                label="Maximum"
                inputMode="decimal"
                autoComplete="off"
                maxLength={16}
                placeholder="Amount"
                value={draft.salaryMax}
                onChange={(event) => set("salaryMax", event.target.value.replace(/[^\d.,\s]/g, ""))}
                onBlur={blur("salaryMax")}
                error={shown("salaryMax")}
                className="min-w-0"
              />
              <FieldFrame id={`${id}-currency`} label="Currency" className="col-span-2 sm:col-span-1">
                <Select
                  value={draft.currency}
                  onValueChange={(value) => {
                    const currency = CURRENCIES.find((option) => option === value);
                    if (currency) set("currency", currency);
                  }}
                >
                  <SelectTrigger id={`${id}-currency`} className="w-full">
                    <SelectValue>{draft.currency}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldFrame>
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              Companies see <Salary range={preview} className="text-base text-foreground" negotiableClassName="text-sm text-foreground" />
            </p>
          </div>
        </ProfileSection>

        <ProfileSection
          id="files"
          title="CV and cover letter"
          lead={`Optional. PDF only, up to ${APPLICATION_FILE_LABEL} each. Accepting an invitation sends copies of them with your application.`}
        >
          <div className="flex flex-col gap-4">
            {KINDS.map((kind) => (
              <PdfSlot
                key={kind}
                kind={kind}
                slot={slots[kind]}
                existing={hasFile(kind)}
                publicationId={base?.id ?? null}
                onPick={(event) => pick(kind, event)}
                onDiscard={() => patchSlot(kind, { file: null, state: "idle", error: null })}
                onToggleRemove={() => patchSlot(kind, { remove: !slots[kind].remove })}
              />
            ))}
          </div>
        </ProfileSection>
      </fieldset>

      {phase === "files" ? (
        <div ref={reportRef} tabIndex={-1} className="flex flex-col gap-4 outline-none">
          {failed.length > 0 ? (
            <FormAlert tone="attention" message={failureMessage(failed)}>
              Everything else is saved. Retry, or open the publication and add the file later from Edit.
            </FormAlert>
          ) : (
            <FormAlert tone="success" message="All files uploaded." />
          )}
          {failed.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border rounded-[12px] border border-border bg-card">
              {failed.map((kind) => (
                <li key={kind} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="min-w-0 text-sm">
                    <span className="font-semibold">{FILE_LABEL[kind]}</span>{" "}
                    <span className="break-words text-muted-foreground">{slots[kind].error}</span>
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => retry(kind)} disabled={uploading} className="w-fit shrink-0">
                    <RotateCwIcon aria-hidden />
                    {slots[kind].state === "uploading" ? "Uploading" : `Retry ${FILE_LABEL[kind].toLowerCase()}`}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={doneHref}>
                Continue to publication
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.publications}>My publications</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 border-t border-border pt-8">
          {reviewNote ? <FormAlert tone="attention" message={REVIEW_NOTE} /> : null}
          {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
          {submitted && Object.keys(errors).length > 0 ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              Fix the highlighted fields, then try again.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <Button type="submit" size="lg" disabled={locked} className="w-full sm:w-auto">
              {phase === "saving" ? "Saving..." : creating ? "Create publication" : reviewNote ? "Save and send to review" : "Save changes"}
              {phase === "saving" ? null : <ArrowRightIcon aria-hidden />}
            </Button>
            <Button asChild variant="outline" size="lg" className={cn("w-full sm:w-auto", locked && "pointer-events-none opacity-50")}>
              <Link href={doneHref} aria-disabled={locked}>
                Cancel
              </Link>
            </Button>
            <Notice message={notice} />
          </div>
        </div>
      )}
    </form>
  );
}

function amountOf(text: string): number | null {
  const amount = parseAmount(text);
  return amount.kind === "valid" ? amount.value : null;
}

function ChoiceGroup<T extends string>({
  legend,
  options,
  labels,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly T[];
  labels: Record<T, string>;
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex items-center gap-2 text-sm leading-none font-semibold">
        {legend} <span className="font-normal text-muted-foreground">Pick any, or none for any</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="relative flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-input bg-card px-4 text-[0.95rem] font-medium transition-colors duration-150 hover:border-foreground/35 has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-3 has-focus-visible:ring-ring/40 has-disabled:cursor-not-allowed has-disabled:opacity-60"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="sr-only"
            />
            {labels[option]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface PdfSlotProps {
  kind: PublicationFileKind;
  slot: Slot;
  existing: boolean;
  publicationId: string | null;
  onPick: (event: ChangeEvent<HTMLInputElement>) => void;
  onDiscard: () => void;
  onToggleRemove: () => void;
}

function PdfSlot({ kind, slot, existing, publicationId, onPick, onDiscard, onToggleRemove }: PdfSlotProps) {
  const inputId = useId();
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const label = FILE_LABEL[kind];

  async function openExisting() {
    if (!publicationId) return;
    setOpening(true);
    setOpenError(null);
    try {
      await openInNewTab(() => getPublicationFile(publicationId, kind));
    } catch (reason: unknown) {
      setOpenError(formError(reason).message);
    } finally {
      setOpening(false);
    }
  }

  let status: string;
  if (slot.file) status = `${slot.file.name} · ${formatBytes(slot.file.size)}${existing ? " · replaces the current file" : ""}`;
  else if (existing && slot.remove) status = "Removed when you save";
  else if (existing) status = "Attached";
  else status = "Not attached";

  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <FileTextIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold">{label}</span>
            <span className={cn("text-sm break-words text-muted-foreground", existing && slot.remove && "text-destructive")}>
              {status}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {existing && !slot.file && !slot.remove ? (
            <Button type="button" variant="ghost" size="sm" onClick={openExisting} disabled={opening}>
              {opening ? "Opening" : "Open"}
              <span className="sr-only">(opens in a new tab)</span>
            </Button>
          ) : null}
          {slot.file ? (
            <Button type="button" variant="ghost" size="sm" onClick={onDiscard}>
              <XIcon aria-hidden />
              Discard
            </Button>
          ) : (
            <>
              <input id={inputId} type="file" accept={PDF_ACCEPT} onChange={onPick} className="peer sr-only" />
              <Button asChild variant="outline" size="sm" className="peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40">
                <label htmlFor={inputId} className="cursor-pointer">
                  {existing ? "Replace" : "Choose PDF"}
                </label>
              </Button>
            </>
          )}
          {existing && !slot.file ? (
            <Button type="button" variant="ghost" size="sm" onClick={onToggleRemove}>
              {slot.remove ? <Undo2Icon aria-hidden /> : <XIcon aria-hidden />}
              {slot.remove ? "Keep" : "Remove"}
            </Button>
          ) : null}
        </div>
      </div>
      {slot.pickError ? <p className="text-sm font-medium text-destructive">{slot.pickError}</p> : null}
      {openError ? <p className="text-sm font-medium text-destructive">{openError}</p> : null}
    </div>
  );
}
