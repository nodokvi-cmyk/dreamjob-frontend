import { countWords } from "@/lib/applications";
import { matchCategory } from "@/lib/categories";
import { PUBLICATION_LIMITS } from "@/lib/publications";
import { OTHER_CATEGORY, parseAmount } from "@/lib/vacancyForm";
import type {
  Currency,
  EmploymentType,
  Publication,
  PublicationInput,
  PublicationUpdateInput,
  WorkMode,
} from "@/types";

export interface PublicationDraft {
  title: string;
  about: string;
  category: string;
  customCategory: string;
  employmentTypes: EmploymentType[];
  workModes: WorkMode[];
  locations: string[];
  skills: string[];
  salaryMin: string;
  salaryMax: string;
  currency: Currency;
  experienceYears: string;
}

export type PublicationField = keyof PublicationDraft;

export type PublicationErrors = Partial<Record<PublicationField, string>>;

export function emptyPublicationDraft(): PublicationDraft {
  return {
    title: "",
    about: "",
    category: "",
    customCategory: "",
    employmentTypes: [],
    workModes: [],
    locations: [""],
    skills: [""],
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    experienceYears: "",
  };
}

function numberText(value: number | null): string {
  return value === null ? "" : String(value);
}

export function publicationDraftFrom(publication: Publication): PublicationDraft {
  const known = matchCategory(publication.category);
  return {
    title: publication.title,
    about: publication.about,
    category: known ?? (publication.category ? OTHER_CATEGORY : ""),
    customCategory: known ? "" : publication.category,
    employmentTypes: [...publication.employmentTypes],
    workModes: [...publication.workModes],
    locations: publication.locations.length > 0 ? [...publication.locations] : [""],
    skills: publication.skills.length > 0 ? [...publication.skills] : [""],
    salaryMin: numberText(publication.salaryMin),
    salaryMax: numberText(publication.salaryMax),
    currency: publication.currency,
    experienceYears: numberText(publication.experienceYears),
  };
}

export function cleanList(items: readonly string[]): string[] {
  return items.map((item) => item.trim()).filter((item) => item !== "");
}

function hasDuplicate(items: readonly string[]): boolean {
  const seen = new Set<string>();
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function amountValue(text: string): number | undefined {
  const amount = parseAmount(text);
  return amount.kind === "valid" ? amount.value : undefined;
}

const EXPERIENCE = /^\d{1,2}$/;

function experienceValue(text: string): number | undefined {
  const cleaned = text.trim();
  if (!EXPERIENCE.test(cleaned)) return undefined;
  const value = Number(cleaned);
  return value <= PUBLICATION_LIMITS.experienceMax ? value : undefined;
}

export function publicationCategory(draft: PublicationDraft): string {
  return draft.category === OTHER_CATEGORY ? draft.customCategory.trim() : draft.category;
}

const AMOUNT_HINT = "Enter a number from 1 to 1,000,000,000, with up to 2 decimals.";

function listError(
  items: readonly string[],
  noun: string,
  max: number,
  maxLength: number,
): string | undefined {
  const cleaned = cleanList(items);
  if (cleaned.length > max) return `Add at most ${max} ${noun}.`;
  if (cleaned.some((item) => item.length > maxLength)) return `Keep each one to ${maxLength} characters.`;
  if (hasDuplicate(cleaned)) return `Each one only once.`;
  return undefined;
}

export function validatePublicationDraft(draft: PublicationDraft): PublicationErrors {
  const errors: PublicationErrors = {};
  const limits = PUBLICATION_LIMITS;
  const title = draft.title.trim();
  if (title === "") errors.title = "Add a title, for example the job you are looking for.";
  else if (title.length > limits.title) errors.title = `Keep the title to ${limits.title} characters.`;

  const about = draft.about.trim();
  if (about === "") errors.about = "Tell companies about yourself and the job you want.";
  else if (about.length > limits.about) errors.about = `Keep it to ${limits.about} characters.`;
  else if (countWords(about) > limits.aboutWords) errors.about = `Keep it to ${limits.aboutWords} words.`;

  if (draft.category === "") errors.category = "Choose a category.";
  else if (draft.category === OTHER_CATEGORY) {
    const custom = draft.customCategory.trim();
    if (custom === "") errors.customCategory = "Name the category.";
    else if (custom.length > limits.category) errors.customCategory = `Keep it to ${limits.category} characters.`;
  }

  const locations = listError(draft.locations, "locations", limits.locations, limits.location);
  if (locations) errors.locations = locations;
  const skills = listError(draft.skills, "skills", limits.skills, limits.skill);
  if (skills) errors.skills = skills;

  const min = parseAmount(draft.salaryMin);
  const max = parseAmount(draft.salaryMax);
  if (min.kind === "invalid") errors.salaryMin = AMOUNT_HINT;
  if (max.kind === "invalid") errors.salaryMax = AMOUNT_HINT;
  if (min.kind === "valid" && max.kind === "valid" && min.value >= max.value) {
    errors.salaryMax = "Make the maximum higher than the minimum. For one amount, fill only the minimum.";
  }

  if (draft.experienceYears.trim() !== "" && experienceValue(draft.experienceYears) === undefined) {
    errors.experienceYears = `Enter whole years from 0 to ${limits.experienceMax}.`;
  }
  return errors;
}

export function toPublicationInput(draft: PublicationDraft): PublicationInput {
  const input: PublicationInput = {
    title: draft.title.trim(),
    about: draft.about.trim(),
    category: publicationCategory(draft),
    employmentTypes: [...draft.employmentTypes],
    workModes: [...draft.workModes],
    locations: cleanList(draft.locations),
    skills: cleanList(draft.skills),
    currency: draft.currency,
  };
  const salaryMin = amountValue(draft.salaryMin);
  const salaryMax = amountValue(draft.salaryMax);
  const experienceYears = experienceValue(draft.experienceYears);
  if (salaryMin !== undefined) input.salaryMin = salaryMin;
  if (salaryMax !== undefined) input.salaryMax = salaryMax;
  if (experienceYears !== undefined) input.experienceYears = experienceYears;
  return input;
}

function sameList<T extends string>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function sameSet<T extends string>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item));
}

export function toPublicationUpdate(draft: PublicationDraft, original: Publication): PublicationUpdateInput {
  const next = toPublicationInput(draft);
  const input: PublicationUpdateInput = {};
  if (next.title !== original.title) input.title = next.title;
  if (next.about !== original.about) input.about = next.about;
  if (next.category !== original.category) input.category = next.category;
  if (!sameSet(next.employmentTypes, original.employmentTypes)) input.employmentTypes = next.employmentTypes;
  if (!sameSet(next.workModes, original.workModes)) input.workModes = next.workModes;
  if (!sameList(next.locations, original.locations)) input.locations = next.locations;
  if (!sameList(next.skills, original.skills)) input.skills = next.skills;
  if (next.currency !== original.currency) input.currency = next.currency;
  const salaryMin = next.salaryMin ?? null;
  const salaryMax = next.salaryMax ?? null;
  const experienceYears = next.experienceYears ?? null;
  if (salaryMin !== original.salaryMin) input.salaryMin = salaryMin;
  if (salaryMax !== original.salaryMax) input.salaryMax = salaryMax;
  if (experienceYears !== original.experienceYears) input.experienceYears = experienceYears;
  return input;
}
