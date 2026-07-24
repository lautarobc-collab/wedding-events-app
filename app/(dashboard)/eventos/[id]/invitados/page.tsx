import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { GuestSummary } from "@/components/guests/GuestSummary";
import { GuestRow } from "@/components/guests/GuestRow";
import { NewGuestForm } from "@/components/guests/NewGuestForm";
import type { Guest, RsvpResponse } from "@/lib/types";

type GuestWithRsvp = Guest & { rsvp_responses: RsvpResponse[] };

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return null;

  const supabase = await createClient();
  const { data: guestsData } = await supabase
    .from("guests")
    .select("*, rsvp_responses(*)")
    .eq("event_id", id)
    .order("first_name", { ascending: true })
    .returns<GuestWithRsvp[]>();

  const guests = guestsData ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Invitados</h1>

      <GuestSummary guests={guests} />

      <div className="flex flex-col gap-2">
        {guests.map((guest) => (
          <GuestRow
            key={guest.id}
            eventId={event.id}
            slug={event.public_slug}
            guest={guest}
          />
        ))}
        {guests.length === 0 && (
          <p className="text-sm text-neutral-500">Todavía no añadiste invitados.</p>
        )}
      </div>

      <NewGuestForm eventId={event.id} />
    </div>
  );
}
