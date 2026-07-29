import { getEvent } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { EventHeaderCard } from "@/components/events/EventHeaderCard";
import { ShareSummaryToggle } from "@/components/events/ShareSummaryToggle";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { QuickAddPanel } from "@/components/dashboard/QuickAddPanel";
import { sumBudget } from "@/lib/budget";
import { guestAttendingStatus } from "@/lib/rsvp";
import type { BudgetItem, Category, Guest, RsvpResponse, Task, Vendor } from "@/lib/types";

type GuestWithRsvp = Guest & { rsvp_responses: RsvpResponse[] };

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

  const categories = categoriesData ?? [];
  const categoryIds = categories.map((category) => category.id);

  const [{ data: guestsData }, { data: tasksData }, { data: budgetItemsData }, { data: vendorsData }] =
    await Promise.all([
      supabase
        .from("guests")
        .select("*, rsvp_responses(*)")
        .eq("event_id", id)
        .order("first_name", { ascending: true })
        .returns<GuestWithRsvp[]>(),
      supabase
        .from("tasks")
        .select("*")
        .eq("event_id", id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .returns<Task[]>(),
      categoryIds.length > 0
        ? supabase
            .from("budget_items")
            .select("*")
            .in("category_id", categoryIds)
            .returns<BudgetItem[]>()
        : Promise.resolve({ data: [] as BudgetItem[] }),
      categoryIds.length > 0
        ? supabase
            .from("vendors")
            .select("*")
            .in("category_id", categoryIds)
            .returns<Vendor[]>()
        : Promise.resolve({ data: [] as Vendor[] }),
    ]);

  const guests = guestsData ?? [];
  const tasks = tasksData ?? [];
  const budgetItems = budgetItemsData ?? [];
  // Los proveedores archivados no cuentan en el resumen, igual que en
  // Presupuesto y Proveedores.
  const vendors = (vendorsData ?? []).filter((vendor) => !vendor.archived);

  // Un proveedor "elegido" con un gasto ya vinculado EN SU PROPIA CATEGORÍA
  // no se vuelve a sumar aparte (evita contar el mismo coste dos veces). Se
  // comprueba por categoría, no solo por vendor_id: un proveedor puede estar
  // vinculado a mano a un gasto de otra categoría sin que eso cubra su
  // propia línea de "elegido" — mismo criterio que en Presupuesto.
  const chosenVendors = vendors.filter(
    (vendor) =>
      vendor.status === "elegido" &&
      !budgetItems.some(
        (item) => item.vendor_id === vendor.id && item.category_id === vendor.category_id,
      ),
  );
  const { estimated: budgetEstimated, actual: budgetActual } = sumBudget(budgetItems, chosenVendors);

  const guestsConfirmed = guests.filter(
    (guest) => guestAttendingStatus(guest.rsvp_responses) === "si",
  ).length;
  const tasksPending = tasks.filter((task) => task.status !== "completado").length;
  const vendorsChosenCount = vendors.filter((vendor) => vendor.status === "elegido").length;

  return (
    <div className="flex flex-col gap-6">
      <EventHeaderCard event={event} />

      <SummaryCards
        eventId={event.id}
        budgetEstimated={budgetEstimated}
        budgetActual={budgetActual}
        guestsTotal={guests.length}
        guestsConfirmed={guestsConfirmed}
        tasksTotal={tasks.length}
        tasksPending={tasksPending}
        vendorsTotal={vendors.length}
        vendorsChosen={vendorsChosenCount}
      />

      <UpcomingTasks eventId={event.id} tasks={tasks} />

      <ShareSummaryToggle eventId={event.id} summaryPublicToken={event.summary_public_token} />

      <QuickAddPanel
        eventId={event.id}
        categories={categories}
        guests={guests}
        tasks={tasks}
        budgetItems={budgetItems}
        vendors={vendors}
      />
    </div>
  );
}
