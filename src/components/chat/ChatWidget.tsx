"use client";

import { MessageCircleIcon, RotateCcwIcon, SendIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ChatCards } from "@/components/chat/ChatCards";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  CHAT_MESSAGE_MAX,
  CHAT_TIMED_OUT,
  CHAT_TIMEOUT_MS,
  CHAT_TOO_FAST,
  chatGreeting,
  chatStore,
  chatWindow,
  newEntryId,
  type ChatEntry,
} from "@/lib/chat";
import { formError } from "@/lib/errors";
import { ApiError } from "@/services/api";
import { sendChat } from "@/services/chat.service";
import type { AuthRole } from "@/types";

export function ChatWidget() {
  const { status, session } = useAuth();
  const [open, setOpen] = useState(false);
  const owner = session?.accountId ?? null;
  const role = session?.accountRole ?? null;

  if (status === "loading") return null;

  return (
    <>
      {open ? (
        <ChatPanel key={owner ?? "anonymous"} owner={owner} role={role} onClose={() => setOpen(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-enamel pr-5 pl-4 text-on-enamel shadow-[0_12px_30px_-10px_rgb(7_12_34/0.55)] ring-2 ring-line-scarlet transition-transform duration-150 outline-none hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/60 sm:right-6 sm:bottom-6"
        >
          <MessageCircleIcon aria-hidden className="size-5" />
          <span className="transit-label text-[0.9rem]">Ask the assistant</span>
        </button>
      )}
    </>
  );
}

interface ChatPanelProps {
  owner: string | null;
  role: AuthRole | null;
  onClose: () => void;
}

function errorText(error: unknown, timedOut: boolean): string {
  if (timedOut) return CHAT_TIMED_OUT;
  if (error instanceof ApiError && error.status === 429) return CHAT_TOO_FAST;
  if (error instanceof ApiError && error.status === 503) return error.message;
  return formError(error).message;
}

function ChatPanel({ owner, role, onClose }: ChatPanelProps) {
  const titleId = useId();
  const inputId = useId();
  const [entries, setEntries] = useState<ChatEntry[]>(() => chatStore.read(owner));
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatStore.write(owner, entries);
  }, [owner, entries]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries.length, pending]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => controller.current?.abort();
  }, []);

  async function send() {
    const text = draft.trim();
    if (!text || pending) return;
    const previous = entries;
    const next = [...previous, { id: newEntryId(), role: "user" as const, content: text, cards: [] }];
    setEntries(next);
    setDraft("");
    setError(null);
    setPending(true);
    const current = new AbortController();
    controller.current = current;
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      current.abort();
    }, CHAT_TIMEOUT_MS);
    try {
      const reply = await sendChat(chatWindow(next), current.signal);
      setEntries([...next, { id: newEntryId(), role: "assistant", content: reply.reply, cards: reply.cards }]);
    } catch (caught: unknown) {
      if (current.signal.aborted && !timedOut) return;
      setEntries(previous);
      setDraft(text);
      setError(errorText(caught, timedOut));
    } finally {
      window.clearTimeout(timer);
      if (controller.current === current) controller.current = null;
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed right-4 bottom-4 left-4 z-40 flex h-[min(38rem,calc(100dvh-6rem))] flex-col overflow-hidden rounded-[22px] border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgb(7_12_34/0.45)] sm:left-auto sm:w-[26rem] sm:right-6 sm:bottom-6"
    >
      <header className="flex items-start justify-between gap-3 border-b-4 border-line-scarlet bg-enamel px-4 py-3 text-on-enamel">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id={titleId} className="font-display text-lg leading-tight font-bold uppercase">
            Assistant
          </h2>
          <p className="text-sm text-on-enamel-muted">{chatGreeting(role)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {entries.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setEntries([]);
                setError(null);
              }}
              disabled={pending}
              aria-label="Start a new conversation"
              className="text-on-enamel hover:bg-white/10 hover:text-on-enamel"
            >
              <RotateCcwIcon aria-hidden />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close the assistant"
            className="text-on-enamel hover:bg-white/10 hover:text-on-enamel"
          >
            <XIcon aria-hidden />
          </Button>
        </div>
      </header>

      <div aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {entries.length === 0 ? (
          <p className="rounded-xl bg-muted px-3 py-2.5 text-[0.95rem]">
            {chatGreeting(role)}. Ask in your own words, for example
            {role === "company" ? " “React developers in Tbilisi”." : " “remote React jobs in Tbilisi”."} It can&apos;t see
            your account, applications or files; paste text you want tips on.
          </p>
        ) : null}
        {entries.map((entry) =>
          entry.role === "user" ? (
            <p
              key={entry.id}
              className="ml-8 self-end rounded-xl bg-foreground px-3 py-2 text-[0.95rem] break-words whitespace-pre-line text-background"
            >
              {entry.content}
            </p>
          ) : (
            <div key={entry.id} className="mr-4 flex flex-col gap-2">
              <p className="rounded-xl bg-muted px-3 py-2 text-[0.95rem] break-words whitespace-pre-line">{entry.content}</p>
              <ChatCards cards={entry.cards} role={role} />
            </div>
          ),
        )}
        {pending ? (
          <p role="status" className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-muted px-3 py-2.5">
            <span className="sr-only">The assistant is typing</span>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                aria-hidden
                className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce"
                style={{ animationDelay: `${dot * 150}ms` }}
              />
            ))}
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border px-3 py-3">
        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <label htmlFor={inputId} className="sr-only">
            Message
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            rows={2}
            value={draft}
            maxLength={CHAT_MESSAGE_MAX}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message"
            className="max-h-40 min-h-11 flex-1 resize-none rounded-[12px] border border-input bg-card px-3 py-2 text-[0.95rem] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="icon" disabled={pending || draft.trim() === ""} aria-label="Send message">
            <SendIcon aria-hidden />
          </Button>
        </div>
      </form>
    </section>
  );
}
