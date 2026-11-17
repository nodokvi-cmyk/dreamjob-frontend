"use client";

import { XIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { cancelInvitation } from "@/services/invitations.service";

interface CancelInvitationProps {
  invitationId: string;
  size?: "sm" | "default";
  onDone: () => void;
  onStale: (message: string) => void;
}

export function CancelInvitation({ invitationId, size = "default", onDone, onStale }: CancelInvitationProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="outline" size={size} className="w-fit">
          <XIcon aria-hidden />
          Cancel invitation
        </Button>
      }
      title="Cancel this invitation?"
      description={
        <p>The job seeker can no longer accept it. Cancelling does not give the invitation back to your monthly quota.</p>
      }
      confirmLabel="Cancel invitation"
      pendingLabel="Cancelling"
      cancelLabel="Keep it"
      tone="danger"
      onConfirm={async () => {
        try {
          await cancelInvitation(invitationId);
        } catch (error: unknown) {
          if (error instanceof ApiError && (error.status === 400 || error.status === 409)) {
            onStale(error.message);
            return;
          }
          throw error;
        }
        onDone();
      }}
    />
  );
}
