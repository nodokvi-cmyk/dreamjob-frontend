import { isObject } from "@/lib/decode";
import { parseChatCard } from "@/services/chat.service";
import type { AuthRole, ChatCard, ChatRole, ChatTurn } from "@/types";

export const CHAT_MESSAGE_MAX = 3000;
export const CHAT_TOTAL_MAX = 8000;
export const CHAT_SENT_TURNS = 10;
export const CHAT_TIMEOUT_MS = 30_000;
export const CHAT_TOO_FAST = "You are sending messages too fast, wait a moment";
export const CHAT_TIMED_OUT = "The assistant took too long to answer. Try again.";

const STORE_KEY = "dreamjob.chat";

export interface ChatEntry {
  id: string;
  role: ChatRole;
  content: string;
  cards: ChatCard[];
}

function parseEntry(value: unknown): ChatEntry | null {
  if (!isObject(value)) return null;
  const { id, role, content, cards } = value;
  if (typeof id !== "string" || typeof content !== "string") return null;
  if (role !== "user" && role !== "assistant") return null;
  const parsed: ChatCard[] = [];
  if (Array.isArray(cards)) {
    for (const card of cards) {
      try {
        parsed.push(parseChatCard(card));
      } catch {
        return null;
      }
    }
  }
  return { id, role, content, cards: parsed };
}

export const chatStore = {
  read(owner: string | null): ChatEntry[] {
    try {
      const raw = window.sessionStorage.getItem(STORE_KEY);
      if (raw === null) return [];
      const data: unknown = JSON.parse(raw);
      if (!isObject(data) || data.owner !== owner || !Array.isArray(data.entries)) return [];
      const entries: ChatEntry[] = [];
      for (const item of data.entries) {
        const entry = parseEntry(item);
        if (entry) entries.push(entry);
      }
      return entries;
    } catch {
      return [];
    }
  },
  write(owner: string | null, entries: ChatEntry[]) {
    try {
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ owner, entries }));
    } catch {}
  },
  clear() {
    try {
      window.sessionStorage.removeItem(STORE_KEY);
    } catch {}
  },
};

export function chatWindow(entries: readonly ChatEntry[]): ChatTurn[] {
  const turns = entries
    .slice(-CHAT_SENT_TURNS)
    .map((entry) => ({ role: entry.role, content: entry.content.trim().slice(0, CHAT_MESSAGE_MAX).trim() }))
    .filter((turn) => turn.content !== "");
  let total = turns.reduce((sum, turn) => sum + turn.content.length, 0);
  while (turns.length > 1 && total > CHAT_TOTAL_MAX) {
    const dropped = turns.shift();
    total -= dropped ? dropped.content.length : 0;
  }
  return turns;
}

export function chatGreeting(role: AuthRole | null): string {
  if (role === "company") return "I can find job seekers' publications";
  if (role === "admin") return "I can find vacancies and job seekers' publications";
  return "I can find vacancies and help with your CV";
}

export function newEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
