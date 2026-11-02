"use client";

import { ArrowRightIcon, RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { PhotoField } from "@/components/dashboard/PhotoField";
import { RequirementsField } from "@/components/dashboard/RequirementsField";
import { usePhotoItems, type NewPhoto, type PhotoItem } from "@/components/dashboard/usePhotoItems";
import { FormAlert } from "@/components/form/FormAlert";
import { FieldFrame, TextAreaField, TextField, describedBy } from "@/components/form/TextField";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { formError } from "@/lib/errors";
import { ownVacancyHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  CURRENCIES,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  WORK_MODE_LABELS,
  WORK_MODES,
  formatDay,
  formatSalary,
  tbilisiDay,
} from "@/lib/vacancy";
import {
  LIMITS,
  OTHER_CATEGORY,
  changesContent,
  deadlineBounds,
  draftFrom,
  emptyDraft,
  parseAmount,
  toCreateInput,
  toUpdateInput,
  validateDraft,
  type DraftField,
  type VacancyDraft,
} from "@/lib/vacancyForm";
import {
  createVacancy,
  removeVacancyPhoto,
  updateVacancy,
  uploadVacancyPhoto,
} from "@/services/vacancies.service";
import type { CurrentCompany, OwnVacancy } from "@/types";

type Phase = "editing" | "saving" | "photos";

type SavedPhoto = Extract<PhotoItem, { kind: "saved" }>;

interface VacancyFormProps {
  account: CurrentCompany;
  now: number;
  vacancy?: OwnVacancy;
}

const REVIEW_WARNING =
  "This vacancy will go back to review and leave the public site until it is approved again.";

function photoNumbers(numbers: number[]): string {
  if (numbers.length === 1) return `photo ${numbers[0]}`;
  const head = numbers.slice(0, -1).join(", ");
  return `photos ${head} and ${numbers[numbers.length - 1]}`;
}

export function VacancyForm({ account, now, vacancy }: VacancyFormProps) {
  const router = useRouter();
  const id = useId();
  const creating = vacancy === undefined;
  const [base, setBase] = useState<OwnVacancy | undefined>(vacancy);
  const [draft, setDraft] = useState<VacancyDraft>(() => (vacancy ? draftFrom(vacancy) : emptyDraft()));
  const [touched, setTouched] = useState<ReadonlySet<DraftField>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>("editing");
  const [savedId, setSavedId] = useState<string | null>(vacancy?.id ?? null);
  const [warn, setWarn] = useState(false);
  const { error, notice, fail, succeed, reset } = useAction();
  const photos = usePhotoItems(vacancy?.photos ?? []);
  const controller = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const originalDeadline = base ? tbilisiDay(Date.parse(base.deadline)) : undefined;
  const errors = validateDraft(draft, now, originalDeadline);
  const bounds = deadlineBounds(now);
  const approved = account.approved;
  const locked = phase !== "editing";

  const shown = (field: DraftField) => (submitted || touched.has(field) ? errors[field] : undefined);
  const set = <K extends DraftField>(field: K, value: VacancyDraft[K]) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const blur = (field: DraftField) => () =>
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));

  const removals = photos.items.filter((item): item is SavedPhoto => item.kind === "saved" && item.remove);
  const additions = photos.items.filter((item): item is NewPhoto => item.kind === "new" && item.state !== "done");
  const uploading = photos.items.some((item) => item.kind === "new" && item.state === "uploading");
  const failed = photos.items
    .map((item, index) => ({ item, number: index + 1 }))
    .filter((entry): entry is { item: NewPhoto; number: number } => entry.item.kind === "new" && entry.item.state === "failed");

  function focusSoon(target: () => HTMLElement | null | undefined) {
    requestAnimationFrame(() => target()?.focus());
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
    if (base) {
      const input = toUpdateInput(draft, base);
      const photoChanges = removals.length > 0 || additions.length > 0;
      if (Object.keys(input).length === 0 && !photoChanges) {
        succeed("Nothing changed.");
        return;
      }
      if (base.status === "published" && (changesContent(input) || photoChanges)) {
        setWarn(true);
        return;
      }
    }
    void save();
  }

  async function uploadOne(vacancyId: string, item: NewPhoto, signal: AbortSignal): Promise<boolean> {
    photos.update(item.key, { state: "uploading", progress: 0, error: null });
    try {
      await uploadVacancyPhoto(
        vacancyId,
        item.file,
        (progress) => photos.update(item.key, { progress }),
        signal,
      );
      photos.update(item.key, { state: "done", progress: 1 });
      return true;
    } catch (reason: unknown) {
      if (signal.aborted) return false;
      photos.update(item.key, { state: "failed", progress: 0, error: formError(reason).message });
      return false;
    }
  }

  async function save() {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const { signal } = current;
    setPhase("saving");
    reset();

    let vacancyId: string;
    try {
      if (base) {
        vacancyId = base.id;
        const input = toUpdateInput(draft, base);
        if (Object.keys(input).length > 0) setBase(await updateVacancy(vacancyId, input));
        for (const item of removals) {
          setBase(await removeVacancyPhoto(vacancyId, item.id));
          photos.discard(item.key);
        }
      } else {
        const created = await createVacancy(toCreateInput(draft));
        vacancyId = created.id;
      }
    } catch (reason: unknown) {
      if (signal.aborted) return;
      setPhase("editing");
      fail(formError(reason));
      return;
    }

    setSavedId(vacancyId);
    let failures = 0;
    for (const item of additions) {
      if (signal.aborted) return;
      const ok = await uploadOne(vacancyId, item, signal);
      if (!ok) failures += 1;
    }
    if (signal.aborted) return;
    if (failures === 0) {
      router.push(ownVacancyHref(vacancyId));
      return;
    }
    setPhase("photos");
    focusSoon(() => reportRef.current);
  }

  async function retry(item: NewPhoto) {
    if (!savedId || uploading) return;
    const signal = controller.current?.signal ?? new AbortController().signal;
    await uploadOne(savedId, item, signal);
  }

  const submitLabel = creating
    ? "Submit for review"
    : base?.status === "rejected"
      ? "Save and resubmit"
      : "Save changes";
  const pendingLabel = creating ? "Submitting" : "Saving";
  const preview = formatSalary({
    salaryMin: valueOf(draft.salaryMin),
    salaryMax: valueOf(draft.salaryMax),
    currency: draft.currency,
  });
  const remote = draft.workMode === "remote";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-12">
      <fieldset disabled={locked} className="flex min-w-0 flex-col gap-12">
        <ProfileSection id="role" title="The role">
          <div className="flex flex-col gap-6">
            <TextField
              label="Job title"
              name="title"
              autoComplete="off"
              maxLength={LIMITS.title}
              value={draft.title}
              onChange={(event) => set("title", event.target.value)}
              onBlur={blur("title")}
              error={shown("title")}
              aside={
                <span aria-hidden className="text-xs text-muted-foreground tabular">
                  {draft.title.length} / {LIMITS.title}
                </span>
              }
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldFrame id={`${id}-category`} label="Category" error={shown("category")}>
                <Select
                  value={draft.category}
                  onValueChange={(value) => {
                    set("category", value);
                    blur("category")();
                    if (value === OTHER_CATEGORY) focusSoon(() => document.getElementById(`${id}-custom`));
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
              <FieldFrame id={`${id}-type`} label="Employment type">
                <Select
                  value={draft.employmentType}
                  onValueChange={(value) => {
                    const type = EMPLOYMENT_TYPES.find((option) => option === value);
                    if (type) set("employmentType", type);
                  }}
                >
                  <SelectTrigger id={`${id}-type`} className="w-full">
                    <SelectValue>{EMPLOYMENT_TYPE_LABELS[draft.employmentType]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {EMPLOYMENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldFrame>
            </div>
            {draft.category === OTHER_CATEGORY ? (
              <TextFieldWithId
                id={`${id}-custom`}
                label="Category name"
                value={draft.customCategory}
                maxLength={LIMITS.category}
                onChange={(value) => set("customCategory", value)}
                onBlur={blur("customCategory")}
                error={shown("customCategory")}
                hint="Name it the way seekers would search for it."
              />
            ) : null}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm leading-none font-semibold">Work mode</legend>
              <div className="grid grid-cols-3 gap-2">
                {WORK_MODES.map((mode) => (
                  <label
                    key={mode}
                    className="relative flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-input bg-card px-2 text-[0.95rem] font-medium transition-colors duration-150 hover:border-foreground/35 has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-3 has-focus-visible:ring-ring/40 has-disabled:cursor-not-allowed has-disabled:opacity-60"
                  >
                    <input
                      type="radio"
                      name="workMode"
                      value={mode}
                      checked={draft.workMode === mode}
                      onChange={() => set("workMode", mode)}
                      className="sr-only"
                    />
                    {WORK_MODE_LABELS[mode]}
                  </label>
                ))}
              </div>
            </fieldset>
            <TextField
              label="Location"
              name="location"
              autoComplete="address-level2"
              optional={remote}
              maxLength={LIMITS.location}
              value={draft.location}
              onChange={(event) => set("location", event.target.value)}
              onBlur={blur("location")}
              error={shown("location")}
              hint={remote ? "Optional for remote work. Add a city if you hire from one region." : "City or address, for example Tbilisi."}
            />
          </div>
        </ProfileSection>

        <ProfileSection
          id="pay"
          title="Pay"
          lead="Optional, but seekers filter by pay. Vacancies without it are left out of those results."
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7.5rem]">
              <AmountField
                id={`${id}-min`}
                label="Minimum"
                value={draft.salaryMin}
                onChange={(value) => set("salaryMin", value)}
                onBlur={blur("salaryMin")}
                error={shown("salaryMin")}
              />
              <AmountField
                id={`${id}-max`}
                label="Maximum"
                value={draft.salaryMax}
                onChange={(value) => set("salaryMax", value)}
                onBlur={blur("salaryMax")}
                error={shown("salaryMax")}
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
              {preview ? (
                <>
                  Seekers see{" "}
                  <span className="font-display text-base font-bold text-foreground tabular">{preview}</span>
                </>
              ) : (
                "Seekers see “Salary not specified”."
              )}
            </p>
          </div>
        </ProfileSection>

        <ProfileSection id="about" title="About the role">
          <div className="flex flex-col gap-8">
            <TextAreaField
              label="Description"
              name="description"
              rows={10}
              maxLength={LIMITS.description}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
              onBlur={blur("description")}
              error={shown("description")}
              hint="Plain text. Line breaks are kept. Say what the work is, who the team is, and what you offer."
            />
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-sm leading-none font-semibold">
                Requirements <span className="font-normal text-muted-foreground">Optional</span>
              </h3>
              <RequirementsField
                items={draft.requirements}
                error={submitted ? errors.requirements : undefined}
                onChange={(items) => set("requirements", items)}
              />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection id="photos" title="Photos">
          <PhotoField
            items={photos.items}
            locked={locked}
            onAdd={photos.add}
            onDiscard={photos.discard}
            onToggleRemove={photos.toggleRemove}
          />
        </ProfileSection>

        <ProfileSection id="deadline" title="Closing date">
          <FieldFrame
            id={`${id}-deadline`}
            label="Applications close on"
            error={shown("deadline")}
            hint={`They close at the end of this day, Tbilisi time. Choose a date up to ${formatDay(bounds.max)}.`}
            className="sm:max-w-xs"
          >
            <Input
              id={`${id}-deadline`}
              type="date"
              min={bounds.min}
              max={bounds.max}
              value={draft.deadline}
              onChange={(event) => set("deadline", event.target.value)}
              onBlur={blur("deadline")}
              aria-invalid={shown("deadline") ? true : undefined}
              aria-describedby={describedBy(`${id}-deadline`, true, shown("deadline"))}
              className="tabular"
            />
          </FieldFrame>
        </ProfileSection>
      </fieldset>

      {phase === "photos" ? (
        <div ref={reportRef} tabIndex={-1} className="flex flex-col gap-4 outline-none">
          {failed.length > 0 ? (
            <FormAlert
              tone="attention"
              message={`${creating ? "Vacancy created" : "Changes saved"}, but ${photoNumbers(failed.map((entry) => entry.number))} failed.`}
            >
              Everything else is saved. Retry, or continue without it and add it later from Edit.
            </FormAlert>
          ) : (
            <FormAlert tone="success" message="All photos uploaded." />
          )}
          {failed.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border rounded-[12px] border border-border bg-card">
              {failed.map(({ item, number }) => (
                <li key={item.key} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="min-w-0 text-sm">
                    <span className="font-semibold">Photo {number}</span>{" "}
                    <span className="text-muted-foreground break-words">{item.error}</span>
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => retry(item)} disabled={uploading} className="w-fit shrink-0">
                    <RotateCwIcon aria-hidden />
                    Retry photo {number}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            {savedId ? (
              <Button asChild>
                <Link href={ownVacancyHref(savedId)}>
                  Continue to vacancy
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={routes.dashboard}>Back to dashboard</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 border-t border-border pt-8">
          {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
          {!approved ? (
            <FormAlert tone="attention" message="Posting and editing are paused">
              Our team approves every company before it can post or edit vacancies.
            </FormAlert>
          ) : null}
          {submitted && Object.keys(errors).length > 0 ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              Fix the highlighted fields, then try again.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <Button
              type="submit"
              size="lg"
              disabled={locked || !approved}
              aria-disabled={locked || !approved}
              className="w-full sm:w-auto"
            >
              {phase === "saving" ? (uploading ? "Uploading photos" : pendingLabel) : submitLabel}
              {phase === "saving" ? null : <ArrowRightIcon aria-hidden />}
            </Button>
            <Button asChild variant="outline" size="lg" className={cn("w-full sm:w-auto", locked && "pointer-events-none opacity-50")}>
              <Link href={base ? ownVacancyHref(base.id) : routes.dashboard} aria-disabled={locked}>
                Cancel
              </Link>
            </Button>
            <Notice message={notice} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={warn}
        onOpenChange={setWarn}
        title="Send it back to review?"
        description={<p>{REVIEW_WARNING}</p>}
        confirmLabel="Save and send to review"
        pendingLabel="Saving"
        cancelLabel="Keep editing"
        onConfirm={async () => {
          setWarn(false);
          void save();
        }}
      />
    </form>
  );
}

function valueOf(text: string): number | undefined {
  const amount = parseAmount(text);
  return amount.kind === "valid" ? amount.value : undefined;
}

function AmountField({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <FieldFrame id={id} label={label} error={error} className="min-w-0">
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        maxLength={16}
        placeholder="Amount"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.,\s]/g, ""))}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, null, error)}
        className="tabular"
      />
    </FieldFrame>
  );
}

function TextFieldWithId({
  id,
  label,
  value,
  maxLength,
  hint,
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  hint: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className="sm:max-w-[calc(50%-0.75rem)]">
      <Input
        id={id}
        autoComplete="off"
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldFrame>
  );
}
