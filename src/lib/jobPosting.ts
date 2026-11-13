import { SITE_URL } from "@/lib/site";
import type { EmploymentType, VacancyDetail } from "@/types";

const EMPLOYMENT_TYPES: Record<EmploymentType, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  internship: "INTERN",
  temporary: "TEMPORARY",
};

type JsonLd = Record<string, unknown>;

function salary(vacancy: VacancyDetail): JsonLd | null {
  const { salaryMin, salaryMax, currency } = vacancy;
  if (salaryMin === undefined && salaryMax === undefined) return null;
  const value: JsonLd = { "@type": "QuantitativeValue" };
  if (salaryMin !== undefined && salaryMax !== undefined && salaryMin !== salaryMax) {
    value.minValue = Math.min(salaryMin, salaryMax);
    value.maxValue = Math.max(salaryMin, salaryMax);
  } else {
    value.value = salaryMin ?? salaryMax;
  }
  return { "@type": "MonetaryAmount", currency, value };
}

function place(vacancy: VacancyDetail): JsonLd {
  if (vacancy.workMode === "remote") {
    return {
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "Georgia" },
    };
  }
  const address: JsonLd = { "@type": "PostalAddress", addressCountry: "GE" };
  const locality = vacancy.location.trim();
  if (locality) address.addressLocality = locality;
  return { jobLocation: { "@type": "Place", address } };
}

export function jobPostingJson(vacancy: VacancyDetail): string | null {
  const name = vacancy.companyName.trim();
  if (vacancy.status !== "published" || !name) return null;
  const organization: JsonLd = { "@type": "Organization", name };
  if (vacancy.logoUrl) organization.logo = vacancy.logoUrl;
  const pay = salary(vacancy);
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description: vacancy.description,
    datePosted: vacancy.createdAt,
    validThrough: vacancy.deadline,
    employmentType: EMPLOYMENT_TYPES[vacancy.employmentType],
    hiringOrganization: organization,
    url: `${SITE_URL}/vacancies/${vacancy.id}`,
    ...place(vacancy),
    ...(pay ? { baseSalary: pay } : {}),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
