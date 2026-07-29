import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { MesasView } from "@/components/mesas/MesasView";
import type { Guest, GuestCompanion, SeatingTable } from "@/lib/types";

type GuestWithCompanions = Guest & { guest_companions: GuestCompanion[] };

export default async function MesasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return null;

  const supabase = await createClient();
  const [{ data: tablesData }, { data: guestsData }] = await Promise.all([
    supabase
      .from("tables")
      .select("*")
      .eq("event_id", id)
      .order("sort_order", { ascending: true })
      .returns<SeatingTable[]>(),
    supabase
      .from("guests")
      .select("*, guest_companions(*)")
      .eq("event_id", id)
      .order("first_name", { ascending: true })
      .returns<GuestWithCompanions[]>(),
  ]);

  const tables = tablesData ?? [];
  const guests = guestsData ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Mesas</h1>
      <MesasView eventId={event.id} tables={tables} guests={guests} />
    </div>
  );
}
