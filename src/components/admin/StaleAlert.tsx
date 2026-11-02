import { FormAlert } from "@/components/form/FormAlert";

export function StaleAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <FormAlert tone="error" message={message}>
      The page was refreshed with the latest data.
    </FormAlert>
  );
}
