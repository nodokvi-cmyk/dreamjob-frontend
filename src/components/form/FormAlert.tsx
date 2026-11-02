import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info" | "attention";

const DOT: Record<Tone, string> = {
  error: "bg-line-scarlet ring-line-scarlet/20",
  success: "bg-line-green ring-line-green/20",
  info: "bg-line-cobalt ring-line-cobalt/20",
  attention: "bg-line-amber ring-line-amber/25",
};

const FRAME: Record<Tone, string> = {
  error: "border-destructive/35",
  success: "border-line-green/40",
  info: "border-border",
  attention: "border-line-amber/60",
};

interface FormAlertProps {
  tone: Tone;
  message: string;
  details?: string[];
  children?: ReactNode;
  className?: string;
}

export function FormAlert({ tone, message, details = [], children, className }: FormAlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-[10px] border bg-card px-4 py-3 text-sm",
        FRAME[tone],
        className,
      )}
    >
      <span aria-hidden className={cn("mt-[5px] size-2.5 shrink-0 rounded-full ring-4", DOT[tone])} />
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold", tone === "error" && "text-destructive")}>{message}</p>
        {details.length > 0 ? (
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-muted-foreground">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
        {children ? <div className="mt-1.5 text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}
