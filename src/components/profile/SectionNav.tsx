"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  label: string;
}

function useActiveSection(sections: readonly NavSection[]) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const key = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const ids = key.split(",");
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const atBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        const first = atBottom
          ? [...ids].reverse().find((id) => visible.has(id))
          : ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-140px 0px -50% 0px" },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return { active, setActive };
}

function stateOf(index: number, current: number) {
  if (index < current) return "done";
  if (index === current) return "here";
  return "next";
}

export function SectionNav({ sections }: { sections: readonly NavSection[] }) {
  const { active, setActive } = useActiveSection(sections);
  const current = Math.max(
    0,
    sections.findIndex((section) => section.id === active),
  );
  const stripRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const link = strip?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!strip || !link || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({
      left: link.offsetLeft - strip.clientWidth / 2 + link.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <>
      <nav
        aria-label="Profile sections"
        className="sticky top-[68px] z-30 -mx-4 border-b border-border bg-background/95 backdrop-blur-sm sm:-mx-6 lg:hidden"
      >
        <ol ref={stripRef} className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-5">
          {sections.map((section) => {
            const here = section.id === active;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  data-section={section.id}
                  onClick={() => setActive(section.id)}
                  aria-current={here ? "location" : undefined}
                  className={cn(
                    "transit-label flex h-9 items-center gap-2 rounded-full px-3 text-sm transition-colors",
                    here ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-2.5 rounded-full border-2",
                      here ? "border-foreground bg-line-scarlet" : "border-foreground/30",
                    )}
                  />
                  {section.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <nav aria-label="Profile sections" className="sticky top-24 hidden self-start lg:block">
        <ol className="flex flex-col">
          {sections.map((section, index) => {
            const state = stateOf(index, current);
            const last = index === sections.length - 1;
            return (
              <li key={section.id} className="relative">
                {last ? null : (
                  <span
                    aria-hidden
                    className="absolute top-[26px] bottom-[-10px] left-[11px] w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-foreground/12"
                  >
                    <span
                      className={cn(
                        "block h-full w-full origin-top bg-line-scarlet transition-transform duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                        state === "done" ? "scale-y-100" : "scale-y-0",
                      )}
                    />
                  </span>
                )}
                <a
                  href={`#${section.id}`}
                  onClick={() => setActive(section.id)}
                  aria-current={state === "here" ? "location" : undefined}
                  className="group flex items-center gap-4 rounded-md py-3 pr-3"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 size-[22px] shrink-0 rounded-full border-[5px] transition-colors duration-300",
                      state === "done" && "border-line-scarlet bg-line-scarlet",
                      state === "here" && "border-foreground bg-line-scarlet",
                      state === "next" && "border-foreground/25 bg-background group-hover:border-foreground/50",
                    )}
                  />
                  <span
                    className={cn(
                      "transit-label text-[0.95rem] leading-none transition-colors",
                      state === "next" ? "text-muted-foreground group-hover:text-foreground" : "text-foreground",
                    )}
                  >
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
