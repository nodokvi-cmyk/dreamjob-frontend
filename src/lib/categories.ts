export const CATEGORIES: readonly string[] = [
  "Software Development",
  "Design",
  "Marketing",
  "Sales",
  "Customer Support",
  "Finance",
  "Human Resources",
  "Operations",
  "Education",
  "Healthcare",
  "Hospitality",
  "Legal",
];

export function matchCategory(value: string): string | undefined {
  const wanted = value.trim().toLowerCase();
  return CATEGORIES.find((category) => category.toLowerCase() === wanted);
}
