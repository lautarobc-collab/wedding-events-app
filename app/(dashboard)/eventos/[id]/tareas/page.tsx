import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { TaskSummary } from "@/components/tasks/TaskSummary";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { ExportIcsButton } from "@/components/ExportIcsButton";
import { toCsv } from "@/lib/exportCsv";
import { buildIcs } from "@/lib/ics";
import { describeTaskLink } from "@/lib/taskLinks";
import { TASK_STATUS_LABEL, type BudgetItem, type Category, type Guest, type Task, type Vendor } from "@/lib/types";

export default async function TasksPage({
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

  const [{ data: tasksData }, { data: guestsData }, { data: budgetItemsData }, { data: vendorsData }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("event_id", id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .returns<Task[]>(),
      supabase
        .from("guests")
        .select("*")
        .eq("event_id", id)
        .order("first_name", { ascending: true })
        .returns<Guest[]>(),
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

  const tasks = tasksData ?? [];
  const guests = guestsData ?? [];
  const budgetItems = budgetItemsData ?? [];
  const vendors = vendorsData ?? [];

  const csv = toCsv(tasks, [
    { label: "Título", value: (t) => t.title },
    { label: "Estado", value: (t) => TASK_STATUS_LABEL[t.status] },
    { label: "Fecha límite", value: (t) => t.due_date },
    { label: "Notas", value: (t) => t.notes },
    {
      label: "Vinculada a",
      value: (t) => describeTaskLink(t, event.id, { guests, budgetItems, vendors, categories })?.label,
    },
  ]);

  const icsEvents = [
    ...(event.event_date
      ? [{ uid: `event-${event.id}`, date: event.event_date, summary: event.name }]
      : []),
    ...tasks
      .filter((task) => task.due_date && task.status !== "completado")
      .map((task) => ({ uid: `task-${task.id}`, date: task.due_date as string, summary: task.title })),
  ];
  const ics = buildIcs(event.name, icsEvents);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Tareas</h1>

      <div className="flex flex-wrap gap-2">
        <ExportCsvButton filename="tareas.csv" csv={csv} />
        <ExportIcsButton filename="tareas.ics" content={ics} />
      </div>

      <TaskSummary tasks={tasks} />

      <TaskTimeline
        eventId={event.id}
        tasks={tasks}
        guests={guests}
        budgetItems={budgetItems}
        vendors={vendors}
        categories={categories}
      />

      <NewTaskForm
        eventId={event.id}
        guests={guests}
        budgetItems={budgetItems}
        vendors={vendors}
        categories={categories}
      />
    </div>
  );
}
