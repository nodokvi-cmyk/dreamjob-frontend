import Link from "next/link";
import { InvitationLabel } from "@/components/board/BoardCard";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { experienceText } from "@/components/publications/PublicationView";
import { Salary } from "@/components/vacancies/Salary";
import { authorName } from "@/lib/board";
import { adminPublicationHref, publicationHref, vacancyHref } from "@/lib/routes";
import { formatDate, placeLabel } from "@/lib/vacancy";
import type { AuthRole, ChatCard, ChatPublicationCard, ChatVacancyCard } from "@/types";

export function ChatCards({ cards, role }: { cards: ChatCard[]; role: AuthRole | null }) {
  if (cards.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {cards.map((card) => (
        <li key={`${card.type}-${card.id}`}>
          {card.type === "vacancy" ? <VacancyChatCard card={card} /> : <PublicationChatCard card={card} role={role} />}
        </li>
      ))}
    </ul>
  );
}

function VacancyChatCard({ card }: { card: ChatVacancyCard }) {
  return (
    <article className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <AccountPhoto src={card.logoUrl} kind="company" alt="" size="xs" fit="contain" />
        <span className="min-w-0 truncate text-sm text-muted-foreground">{card.companyName.trim() || "Company"}</span>
      </div>
      <Link
        href={vacancyHref(card.id)}
        className="font-display text-[1.1rem] leading-tight font-semibold break-words decoration-line-scarlet decoration-2 underline-offset-4 hover:underline"
      >
        {card.title}
      </Link>
      <p className="text-sm text-muted-foreground">
        {placeLabel(card)} · closes {formatDate(card.deadline)}
      </p>
      <Salary range={card} className="text-base text-foreground" negotiableClassName="text-sm" />
    </article>
  );
}

function PublicationChatCard({ card, role }: { card: ChatPublicationCard; role: AuthRole | null }) {
  const href = role === "admin" ? adminPublicationHref(card.id) : publicationHref(card.id);
  return (
    <article className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <AccountPhoto src={card.author?.avatarUrl ?? ""} kind="user" alt="" size="xs" fit="cover" />
        <span className="min-w-0 truncate text-sm text-muted-foreground">{authorName(card.author)}</span>
      </div>
      <Link
        href={href}
        className="font-display text-[1.1rem] leading-tight font-semibold break-words decoration-line-scarlet decoration-2 underline-offset-4 hover:underline"
      >
        {card.title}
      </Link>
      <p className="text-sm text-muted-foreground">
        {[card.category, experienceText(card.experienceYears), card.locations.join(", ") || "Any location"]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Salary range={card} className="text-base text-foreground" negotiableClassName="text-sm" />
        <InvitationLabel state={card.invitation} />
      </div>
    </article>
  );
}
