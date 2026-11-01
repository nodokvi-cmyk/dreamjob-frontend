import Link from "next/link";
import { Logo } from "@/components/layout/StationMark";
import { companySignUpHref } from "@/lib/account";
import { routes } from "@/lib/routes";

const LINE_INKS = ["bg-line-scarlet", "bg-line-cobalt", "bg-line-amber", "bg-line-green"];

const COLUMNS = [
  {
    title: "Job seekers",
    links: [
      { href: routes.vacancies, label: "Browse vacancies" },
      { href: routes.signUp, label: "Create an account" },
      { href: routes.signIn, label: "Sign in" },
    ],
  },
  {
    title: "Employers",
    links: [
      { href: companySignUpHref, label: "Post a vacancy" },
      { href: `${routes.signIn}?account=company`, label: "Company sign in" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: routes.forgotPassword, label: "Forgot password" },
      { href: routes.profile, label: "Your profile" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-enamel text-on-enamel">
      <div aria-hidden className="grid h-1.5 grid-cols-4">
        {LINE_INKS.map((ink) => (
          <span key={ink} className={ink} />
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="flex max-w-xs flex-col gap-4">
          <Link href={routes.home} className="w-fit rounded-md" aria-label="DreamJob home">
            <Logo />
          </Link>
          <p className="text-[0.95rem] leading-relaxed text-on-enamel-muted">
            Vacancies across Georgia from employers our team has approved, with the salary on the
            listing.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
            <h2 className="transit-label text-sm text-on-enamel-muted">{column.title}</h2>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm text-[0.95rem] text-on-enamel transition-colors hover:text-line-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-enamel-seam">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-on-enamel-muted sm:px-6 lg:px-8">
          <p>DreamJob · Jobs in Georgia</p>
          <p>Salaries in GEL, USD and EUR</p>
        </div>
      </div>
    </footer>
  );
}
