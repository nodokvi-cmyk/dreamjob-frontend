"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { applyTheme, currentTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative grid size-10 place-items-center rounded-lg border border-enamel-seam text-on-enamel transition-colors hover:bg-enamel-raised",
        className,
      )}
    >
      <SunIcon aria-hidden className="size-[18px] dark:hidden" />
      <MoonIcon aria-hidden className="hidden size-[18px] dark:block" />
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </button>
  );
}
