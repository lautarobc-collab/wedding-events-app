import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { GuestView } from "@/components/guests/GuestView";
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
      <GuestView eventId={event.id} slug={event.public_slug} guests={guests} />
    </div>
  );
}
