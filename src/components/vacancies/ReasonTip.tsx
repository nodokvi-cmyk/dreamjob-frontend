"use client";

import { useState, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ReasonTipProps {
  reason: string;
  children: ReactNode;
  className?: string;
}

export function ReasonTip({ reason, children, className }: ReasonTipProps) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        asChild
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") event.preventDefault();
        }}
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <span
          tabIndex={0}
          className={cn(
            "relative z-10 inline-flex rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            className,
          )}
        >
          {children}
          <span className="sr-only">{reason}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}
