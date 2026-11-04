"use client";

import { ArrowRightIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { Logo } from "@/components/layout/StationMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import {
  accountMenu,
  companyNotice,
  companySignUpHref,
  displayName,
  isActive,
  primaryNav,
  roleLabel,
} from "@/lib/account";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderBar pathname="" />}>
      <CurrentHeader />
    </Suspense>
  );
}

function CurrentHeader() {
  return <HeaderBar pathname={usePathname()} />;
}

function HeaderBar({ pathname }: { pathname: string }) {
  const { status, session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = primaryNav(session);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-line-scarlet bg-enamel text-on-enamel">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-on-enamel focus:px-3 focus:py-2 focus:text-enamel"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:gap-10 lg:px-8">
        <Link href={routes.home} className="rounded-md text-on-enamel" aria-label="GetDreamJob home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden h-full items-stretch gap-1 md:flex">
          {nav.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center px-3 transit-label text-[0.95rem] text-on-enamel-muted transition-colors hover:text-on-enamel",
                  "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-line-green after:opacity-0 after:transition-opacity",
                  active && "text-on-enamel after:opacity-100",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="hidden items-center gap-3 md:flex">
            {status === "loading" || status === "error" ? (
              <span aria-hidden className="h-10 w-44 animate-pulse rounded-lg bg-enamel-raised" />
            ) : session ? (
              <AccountMenu session={session} onSignOut={signOut} />
            ) : (
              <>
                <Button asChild variant="onEnamel">
                  <Link href={routes.signIn}>Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href={companySignUpHref}>
                    Post a vacancy
                    <ArrowRightIcon aria-hidden />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="onEnamel" size="icon" className="md:hidden">
                <MenuIcon aria-hidden className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(22rem,88vw)] gap-0 border-enamel-seam bg-enamel p-0 text-on-enamel [&_[data-slot=sheet-close]]:text-on-enamel [&_[data-slot=sheet-close]]:hover:bg-enamel-raised"
            >
              <SheetHeader className="border-b-4 border-line-scarlet px-5 py-4">
                <SheetTitle className="text-on-enamel">
                  <Logo />
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>

              <nav aria-label="Mobile" className="flex flex-col px-3 py-4">
                {nav.map((link) => (
                  <MobileLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    active={isActive(pathname, link.href)}
                    onNavigate={closeMenu}
                  />
                ))}
              </nav>

              <div className="mt-auto border-t border-enamel-seam px-5 py-5">
                {session ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="truncate text-base font-semibold">{displayName(session)}</p>
                      <p className="text-sm text-on-enamel-muted">{roleLabel(session)}</p>
                      {companyNotice(session) ? (
                        <p className="mt-2 flex items-center gap-2 text-sm text-line-amber">
                          <span aria-hidden className="size-2 rounded-full bg-line-amber" />
                          {companyNotice(session)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col">
                      {accountMenu(session).map((link) => (
                        <MobileLink
                          key={link.href}
                          href={link.href}
                          label={link.label}
                          active={isActive(pathname, link.href)}
                          onNavigate={closeMenu}
                        />
                      ))}
                    </div>
                    <Button variant="onEnamel" className="mt-4 justify-start" onClick={signOut}>
                      <LogOutIcon aria-hidden />
                      Sign out
                    </Button>
                  </div>
                ) : status === "anonymous" ? (
                  <div className="flex flex-col gap-3">
                    <Button asChild size="lg">
                      <Link href={companySignUpHref} onClick={closeMenu}>
                        Post a vacancy
                        <ArrowRightIcon aria-hidden />
                      </Link>
                    </Button>
                    <Button asChild variant="onEnamel" size="lg">
                      <Link href={routes.signIn} onClick={closeMenu}>
                        Sign in
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <span aria-hidden className="block h-12 animate-pulse rounded-lg bg-enamel-raised" />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-3 transit-label text-lg text-on-enamel-muted transition-colors hover:bg-enamel-raised hover:text-on-enamel",
        active && "text-on-enamel",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-3 rounded-full border-2 border-on-enamel-muted",
          active && "border-line-green bg-line-green",
        )}
      />
      {label}
    </Link>
  );
}
