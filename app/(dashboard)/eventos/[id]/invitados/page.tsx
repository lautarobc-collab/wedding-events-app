import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { GuestView } from "@/components/guests/GuestView";
import type { Guest, GuestCompanion, RsvpResponse } from "@/lib/types";

type GuestWithChildren = Guest & {
  rsvp_responses: RsvpResponse[];
  guest_companions: GuestCompanion[];
};

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
    .select("*, rsvp_responses(*), guest_companions(*)")
    .eq("event_id", id)
    .order("first_name", { ascending: true })
    .returns<GuestWithChildren[]>();

  const guests = guestsData ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Invitados</h1>
      <GuestView eventId={event.id} slug={event.public_slug} guests={guests} />
    </div>
  );
}
