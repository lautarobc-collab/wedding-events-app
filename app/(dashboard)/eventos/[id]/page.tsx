import { getEvent } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { EditEventForm } from "@/components/events/EditEventForm";
import { QuickAddPanel } from "@/components/dashboard/QuickAddPanel";
import { EVENT_TYPE_LABEL } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import type { Category } from "@/lib/types";

export default async function EventSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) return null;

  const supabase = await createClient();
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("event_id", id)
    .order("sort_order", { ascending: true })
    .returns<Category[]>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Resumen</h1>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded border border-neutral-200 p-4">
          <dt className="text-sm text-neutral-500">Tipo</dt>
          <dd className="font-medium">{EVENT_TYPE_LABEL[event.event_type]}</dd>
        </div>
        <div className="rounded border border-neutral-200 p-4">
          <dt className="text-sm text-neutral-500">Fecha</dt>
          <dd className="font-medium">{event.event_date ?? "Sin definir"}</dd>
        </div>
        <div className="rounded border border-neutral-200 p-4">
          <dt className="text-sm text-neutral-500">Presupuesto</dt>
          <dd className="font-medium">
            {event.total_budget != null ? formatMoney(event.total_budget) : "Sin definir"}
          </dd>
        </div>
      </dl>

      <EditEventForm event={event} />

      <QuickAddPanel eventId={event.id} categories={categoriesData ?? []} />
    </div>
  );
}
