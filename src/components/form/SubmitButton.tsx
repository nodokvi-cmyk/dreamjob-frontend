import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  pending: boolean;
  label: string;
  pendingLabel: string;
}

export function SubmitButton({ pending, label, pendingLabel }: SubmitButtonProps) {
  return (
    <Button type="submit" size="lg" disabled={pending} aria-disabled={pending} className="w-full">
      {pending ? pendingLabel : label}
      {pending ? null : <ArrowRightIcon aria-hidden />}
    </Button>
  );
}
