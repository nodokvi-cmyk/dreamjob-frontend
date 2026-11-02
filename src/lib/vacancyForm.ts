import { matchCategory } from "@/lib/categories";
import { addDays, endOfTbilisiDay, formatDay, tbilisiDay } from "@/lib/vacancy";
import { SALARY_MAX } from "@/lib/vacancyQuery";
import type {
  Currency,
  EmploymentType,
  Vacancy,
  VacancyInput,
  VacancyUpdateInput,
  WorkMode,
} from "@/types";

export const LIMITS = {
  title: 128,
  description: 5000,
  category: 64,
  location: 128,
  requirement: 200,
  requirements: 20,
  photos: 3,
} as const;

export const OTHER_CATEGORY = "__other";

const FIRST_DAY = 1;
const LAST_DAY = 179;

export interface VacancyDraft {
  title: string;
  description: string;
  category: string;
  customCategory: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin: string;
  salaryMax: string;
  currency: Currency;
  requirements: string[];
  deadline: string;
}

export type DraftField = keyof VacancyDraft;

export type DraftErrors = Partial<Record<DraftField, string>>;

export function emptyDraft(): VacancyDraft {
  return {
    title: "",
    description: "",
    category: "",
    customCategory: "",
    employmentType: "full-time",
    workMode: "onsite",
    location: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    requirements: [""],
    deadline: "",
  };
}

function amountText(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

export function draftFrom(vacancy: Vacancy): VacancyDraft {
  const known = matchCategory(vacancy.category);
  return {
    title: vacancy.title,
    description: vacancy.description,
    category: known ?? (vacancy.category ? OTHER_CATEGORY : ""),
    customCategory: known ? "" : vacancy.category,
    employmentType: vacancy.employmentType,
    workMode: vacancy.workMode,
    location: vacancy.location,
    salaryMin: amountText(vacancy.salaryMin),
    salaryMax: amountText(vacancy.salaryMax),
    currency: vacancy.currency,
    requirements: vacancy.requirements.length > 0 ? [...vacancy.requirements] : [""],
    deadline: tbilisiDay(Date.parse(vacancy.deadline)),
  };
}

export function deadlineBounds(now: number): { min: string; max: string } {
  const today = tbilisiDay(now);
  return { min: addDays(today, FIRST_DAY), max: addDays(today, LAST_DAY) };
}

type Amount = { kind: "empty" } | { kind: "valid"; value: number } | { kind: "invalid" };

const AMOUNT = /^\d{1,10}(\.\d{1,2})?$/;

export function parseAmount(text: string): Amount {
  const cleaned = text.replace(/[\s,]/g, "");
  if (cleaned === "") return { kind: "empty" };
  if (!AMOUNT.test(cleaned)) return { kind: "invalid" };
  const value = Number(cleaned);
  if (value < 1 || value > SALARY_MAX) return { kind: "invalid" };
  return { kind: "valid", value };
}

function amountValue(text: string): number | undefined {
  const amount = parseAmount(text);
  return amount.kind === "valid" ? amount.value : undefined;
}

export function categoryOf(draft: VacancyDraft): string {
  return draft.category === OTHER_CATEGORY ? draft.customCategory.trim() : draft.category;
}

export function cleanRequirements(items: readonly string[]): string[] {
  return items.map((item) => item.trim()).filter((item) => item !== "");
}

const AMOUNT_HINT = "Enter a number from 1 to 1,000,000,000, with up to 2 decimals.";

export function validateDraft(
  draft: VacancyDraft,
  now: number,
  originalDeadline?: string,
): DraftErrors {
  const errors: DraftErrors = {};
  const title = draft.title.trim();
  if (title === "") errors.title = "Add a job title.";
  else if (title.length > LIMITS.title) errors.title = `Keep the title to ${LIMITS.title} characters.`;

  const description = draft.description.trim();
  if (description === "") errors.description = "Describe the role.";
  else if (description.length > LIMITS.description) {
    errors.description = `Keep the description to ${LIMITS.description} characters.`;
  }

  if (draft.category === "") errors.category = "Choose a category.";
  else if (draft.category === OTHER_CATEGORY) {
    const custom = draft.customCategory.trim();
    if (custom === "") errors.customCategory = "Name the category.";
    else if (custom.length > LIMITS.category) {
      errors.customCategory = `Keep the category to ${LIMITS.category} characters.`;
    }
  }

  const location = draft.location.trim();
  if (draft.workMode !== "remote" && location === "") {
    errors.location = "Add a city or address, or set the work mode to Remote.";
  } else if (location.length > LIMITS.location) {
    errors.location = `Keep the location to ${LIMITS.location} characters.`;
  }

  const min = parseAmount(draft.salaryMin);
  const max = parseAmount(draft.salaryMax);
  if (min.kind === "invalid") errors.salaryMin = AMOUNT_HINT;
  if (max.kind === "invalid") errors.salaryMax = AMOUNT_HINT;
  if (min.kind === "valid" && max.kind === "valid" && min.value > max.value) {
    errors.salaryMax = "The maximum can't be lower than the minimum.";
  }

  const requirements = cleanRequirements(draft.requirements);
  if (requirements.length > LIMITS.requirements) {
    errors.requirements = `List up to ${LIMITS.requirements} requirements.`;
  } else if (requirements.some((item) => item.length > LIMITS.requirement)) {
    errors.requirements = `Keep each requirement to ${LIMITS.requirement} characters.`;
  }

  if (draft.deadline === "") {
    errors.deadline = "Choose a closing date.";
  } else if (draft.deadline !== originalDeadline) {
    const { min: first, max: last } = deadlineBounds(now);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.deadline) || draft.deadline < first || draft.deadline > last) {
      errors.deadline = `Choose a date from ${formatDay(first)} to ${formatDay(last)}.`;
    }
  }

  return errors;
}

export function toCreateInput(draft: VacancyDraft): VacancyInput {
  const input: VacancyInput = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: categoryOf(draft),
    employmentType: draft.employmentType,
    workMode: draft.workMode,
    location: draft.location.trim(),
    currency: draft.currency,
    requirements: cleanRequirements(draft.requirements),
    deadline: endOfTbilisiDay(draft.deadline),
  };
  const salaryMin = amountValue(draft.salaryMin);
  const salaryMax = amountValue(draft.salaryMax);
  if (salaryMin !== undefined) input.salaryMin = salaryMin;
  if (salaryMax !== undefined) input.salaryMax = salaryMax;
  return input;
}

function salaryChange(text: string, original: number | undefined): number | null | undefined {
  const value = amountValue(text);
  if (value === original) return undefined;
  return value ?? null;
}

export function toUpdateInput(draft: VacancyDraft, original: Vacancy): VacancyUpdateInput {
  const input: VacancyUpdateInput = {};
  const title = draft.title.trim();
  const description = draft.description.trim();
  const category = categoryOf(draft);
  const location = draft.location.trim();
  const requirements = cleanRequirements(draft.requirements);

  if (title !== original.title) input.title = title;
  if (description !== original.description) input.description = description;
  if (category !== original.category) input.category = category;
  if (draft.employmentType !== original.employmentType) input.employmentType = draft.employmentType;
  if (draft.workMode !== original.workMode) input.workMode = draft.workMode;
  if (location !== original.location) input.location = location;
  if (draft.currency !== original.currency) input.currency = draft.currency;
  if (requirements.join("\n") !== original.requirements.join("\n")) input.requirements = requirements;

  const salaryMin = salaryChange(draft.salaryMin, original.salaryMin);
  const salaryMax = salaryChange(draft.salaryMax, original.salaryMax);
  if (salaryMin !== undefined) input.salaryMin = salaryMin;
  if (salaryMax !== undefined) input.salaryMax = salaryMax;

  if (draft.deadline !== tbilisiDay(Date.parse(original.deadline))) {
    input.deadline = endOfTbilisiDay(draft.deadline);
  }
  return input;
}

export function changesContent(input: VacancyUpdateInput): boolean {
  return Object.keys(input).some((key) => key !== "deadline");
}
