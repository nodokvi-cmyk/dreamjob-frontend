import { Building2Icon, UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PictureKind = "user" | "company";

interface DefaultPictureProps {
  kind: PictureKind;
  label?: string;
  className?: string;
}

export function DefaultPicture({ kind, label, className }: DefaultPictureProps) {
  const Icon = kind === "company" ? Building2Icon : UserRoundIcon;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border border-border bg-muted text-muted-foreground [&_svg]:size-1/2",
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={1.75} />
    </span>
  );
}
