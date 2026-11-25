"use client";

import { MessageCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const loadPanel = () => import("@/components/chat/ChatPanel");

const ChatPanel = dynamic(() => loadPanel().then((module) => module.ChatPanel), {
  loading: () => (
    <section
      role="status"
      className="fixed right-4 bottom-4 left-4 z-40 flex h-24 items-center justify-center rounded-[22px] border border-border bg-popover text-sm text-muted-foreground shadow-[0_24px_60px_-12px_rgb(7_12_34/0.45)] sm:left-auto sm:w-[26rem] sm:right-6 sm:bottom-6"
    >
      Loading the assistant…
    </section>
  ),
});

function preloadPanel() {
  void loadPanel();
}

export function ChatWidget() {
  const { status, session } = useAuth();
  const [open, setOpen] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const returning = useRef(false);
  const owner = session?.accountId ?? null;
  const role = session?.accountRole ?? null;

  useEffect(() => {
    if (open || !returning.current) return;
    returning.current = false;
    launcher.current?.focus();
  }, [open]);

  if (status === "loading") return null;

  return (
    <>
      {open ? (
        <ChatPanel
          key={owner ?? "anonymous"}
          owner={owner}
          role={role}
          onClose={() => {
            returning.current = true;
            setOpen(false);
          }}
        />
      ) : (
        <button
          ref={launcher}
          type="button"
          onClick={() => setOpen(true)}
          onPointerEnter={preloadPanel}
          onFocus={preloadPanel}
          className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-enamel pr-5 pl-4 text-on-enamel shadow-[0_12px_30px_-10px_rgb(7_12_34/0.55)] ring-2 ring-line-scarlet transition-transform duration-150 outline-none hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/60 sm:right-6 sm:bottom-6"
        >
          <MessageCircleIcon aria-hidden className="size-5" />
          <span className="transit-label text-[0.9rem]">Ask the assistant</span>
        </button>
      )}
    </>
  );
}
