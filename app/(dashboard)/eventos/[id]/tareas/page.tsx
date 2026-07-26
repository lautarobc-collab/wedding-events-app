import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { TaskSummary } from "@/components/tasks/TaskSummary";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import type { BudgetItem, Category, Guest, Task, Vendor } from "@/lib/types";

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Tareas</h1>

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
