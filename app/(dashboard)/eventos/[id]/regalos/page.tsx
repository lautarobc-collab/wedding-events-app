import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { GiftRow } from "@/components/gifts/GiftRow";
import type { Guest } from "@/lib/types";

type GuestGift = Pick<Guest, "id" | "first_name" | "last_name" | "gift_description" | "thank_you_sent">;

export default async function GiftsPage({
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
    .select("id, first_name, last_name, gift_description, thank_you_sent")
    .eq("event_id", id)
    .order("first_name", { ascending: true })
    .returns<GuestGift[]>();

  const guests = guestsData ?? [];
  const withGift = guests.filter((g) => g.gift_description);
  const pendingThanks = withGift.filter((g) => !g.thank_you_sent);

  // Pendientes de agradecer primero, luego ya agradecidos, luego sin regalo.
  const sorted = [...guests].sort((a, b) => {
    const rank = (g: GuestGift) => (g.gift_description ? (g.thank_you_sent ? 1 : 0) : 2);
    return rank(a) - rank(b);
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Regalos</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {withGift.length} regalos registrados · {pendingThanks.length} agradecimientos pendientes
      </p>

      <div className="flex flex-col gap-2">
        {sorted.map((guest) => (
          <GiftRow key={guest.id} eventId={event.id} guest={guest} />
        ))}
        {guests.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Todavía no añadiste invitados.</p>
        )}
      </div>
    </div>
  );
}
