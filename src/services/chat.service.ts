import {
  DecodeError,
  array,
  isoDate,
  object,
  oneOf,
  optionalNumber,
  string,
  stringArray,
  stringOr,
  type JsonObject,
} from "@/lib/decode";
import { CURRENCIES, EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/vacancy";
import { api } from "@/services/api";
import { INVITATION_STATES, enumArray, parseAuthor } from "@/services/publications.service";
import type { ChatCard, ChatReply, ChatTurn } from "@/types";

function nullableNumber(source: JsonObject, key: string): number | null {
  return optionalNumber(source, key) ?? null;
}

export function parseChatCard(data: unknown): ChatCard {
  const source = object(data, "card");
  const shared = {
    id: string(source, "id"),
    title: string(source, "title"),
    excerpt: stringOr(source, "excerpt", ""),
    category: stringOr(source, "category", ""),
    salaryMin: nullableNumber(source, "salaryMin"),
    salaryMax: nullableNumber(source, "salaryMax"),
    currency: oneOf(source, "currency", CURRENCIES),
  };
  if (source.type === "vacancy") {
    return {
      type: "vacancy",
      ...shared,
      employmentType: oneOf(source, "employmentType", EMPLOYMENT_TYPES),
      workMode: oneOf(source, "workMode", WORK_MODES),
      location: stringOr(source, "location", ""),
      deadline: isoDate(source, "deadline"),
      company: string(source, "company"),
      companyName: stringOr(source, "companyName", ""),
      logoUrl: stringOr(source, "logoUrl", ""),
    };
  }
  if (source.type === "publication") {
    return {
      type: "publication",
      ...shared,
      employmentTypes: enumArray(source, "employmentTypes", EMPLOYMENT_TYPES),
      workModes: enumArray(source, "workModes", WORK_MODES),
      locations: stringArray(source, "locations"),
      skills: stringArray(source, "skills"),
      experienceYears: nullableNumber(source, "experienceYears"),
      author: parseAuthor(source.author),
      invitation: oneOf(source, "invitation", INVITATION_STATES),
    };
  }
  throw new DecodeError("type");
}

function parseReply(data: unknown): ChatReply {
  const source = object(data, "chat");
  return {
    reply: string(source, "reply"),
    cards: source.cards === undefined || source.cards === null ? [] : array(source.cards, "cards", parseChatCard),
  };
}

export function sendChat(messages: ChatTurn[], signal?: AbortSignal): Promise<ChatReply> {
  return api("/chat", parseReply, { method: "POST", body: { messages }, signal });
}
