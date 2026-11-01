"use client";

import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  accountMenu,
  companyNotice,
  displayName,
  initials,
  roleLabel,
} from "@/lib/account";
import { routes } from "@/lib/routes";
import type { Session } from "@/types";

export function AccountMenu({
  session,
  onSignOut,
}: {
  session: Session;
  onSignOut: () => void;
}) {
  const name = displayName(session);
  const notice = companyNotice(session);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex h-10 items-center gap-2.5 rounded-lg border border-enamel-seam py-1 pr-2.5 pl-1 text-left transition-colors hover:bg-enamel-raised aria-expanded:bg-enamel-raised">
        <span className="relative grid size-8 place-items-center rounded-md bg-on-enamel font-display text-sm font-bold text-enamel">
          {initials(name)}
          {notice ? (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 size-2.5 rounded-full bg-line-amber ring-2 ring-enamel"
            />
          ) : null}
        </span>
        <span className="max-w-[10rem] truncate text-sm font-semibold">{name}</span>
        <ChevronDownIcon
          aria-hidden
          className="size-4 text-on-enamel-muted transition-transform group-aria-expanded:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="truncate text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">{roleLabel(session)}</span>
        </DropdownMenuLabel>
        {notice ? (
          <DropdownMenuItem asChild>
            <Link href={routes.profile} className="text-foreground">
              <span aria-hidden className="size-2 rounded-full bg-line-amber" />
              {notice}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {accountMenu(session).map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href}>{link.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
          <LogOutIcon aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
