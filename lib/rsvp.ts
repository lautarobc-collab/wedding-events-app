import type { RsvpResponse } from "@/lib/types";

export function latestRsvp(responses: RsvpResponse[]): RsvpResponse | null {
  if (!responses.length) return null;
  return [...responses].sort(
    (a, b) => new Date(b.responded_at).getTime() - new Date(a.responded_at).getTime(),
  )[0];
}
