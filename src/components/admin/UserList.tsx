"use client";

import { MailIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Button } from "@/components/ui/button";
import { userHref } from "@/lib/routes";
import { formatDate } from "@/lib/vacancy";
import { deleteUserAsAdmin } from "@/services/admin.service";
import type { User } from "@/types";

interface UserListProps {
  users: User[];
  selfId: string;
  onDeleted: (name: string) => void;
}

function fullName(user: User): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

export function UserList({ users, selfId, onDeleted }: UserListProps) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {users.map((user) => (
        <li key={user._id}>
          <UserRow user={user} self={user._id === selfId} onDeleted={onDeleted} />
        </li>
      ))}
    </ul>
  );
}

function UserRow({ user, self, onDeleted }: { user: User; self: boolean; onDeleted: (name: string) => void }) {
  const name = fullName(user);
  const admin = user.role === "admin";
  const headingId = `user-${user._id}`;

  return (
    <article aria-labelledby={headingId} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <AccountPhoto src={user.avatarUrl} kind="user" alt="" size="row" fit="cover" />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id={headingId} className="text-[1.05rem] font-semibold break-words">
              {admin ? (
                name
              ) : (
                <Link href={userHref(user._id)} className="underline-offset-4 hover:underline">
                  {name}
                </Link>
              )}
            </h2>
            <span
              className={
                admin
                  ? "inline-flex h-6 items-center rounded-full bg-enamel px-2.5 transit-label text-[0.75rem] text-on-enamel"
                  : "inline-flex h-6 items-center rounded-full border border-border px-2.5 transit-label text-[0.75rem] text-muted-foreground"
              }
            >
              {admin ? "Admin" : "Job seeker"}
            </span>
            {self ? <span className="text-sm text-muted-foreground">You</span> : null}
          </div>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5 break-all">
              <MailIcon aria-hidden className="size-4 shrink-0" />
              {user.email}
            </span>
            <span>
              Joined <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
            </span>
          </p>
        </div>
      </div>
      {self ? (
        <p className="text-sm text-muted-foreground sm:max-w-48 sm:text-right">
          Delete your own account from your profile.
        </p>
      ) : (
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-fit" aria-label={`Delete ${name}`}>
              <Trash2Icon aria-hidden />
              Delete
            </Button>
          }
          tone="danger"
          title="Delete this account?"
          description={
            <div className="flex flex-col gap-2">
              <p>
                <span className="font-semibold text-foreground">{name}</span> ({user.email}) is deleted for good. It
                can&apos;t be undone.
              </p>
              <p>
                Their profile, photo, CV, bookmarks and notifications are removed. Their applications stay for companies
                as &ldquo;Deleted user&rdquo;, with no name, files or message.
              </p>
            </div>
          }
          confirmLabel="Delete for good"
          pendingLabel="Deleting"
          cancelLabel="Keep it"
          icon={<Trash2Icon aria-hidden />}
          onConfirm={async () => {
            await deleteUserAsAdmin(user._id);
            onDeleted(name);
          }}
        />
      )}
    </article>
  );
}
