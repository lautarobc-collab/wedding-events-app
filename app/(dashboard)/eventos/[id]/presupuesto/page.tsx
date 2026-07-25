import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { BudgetView } from "@/components/budget/BudgetView";
import type { Category, BudgetItem } from "@/lib/types";

type CategoryWithItems = Category & { budget_items: BudgetItem[] };

export default async function BudgetPage({
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
    .select("*, budget_items(*)")
    .eq("event_id", id)
    .order("sort_order", { ascending: true })
    .returns<CategoryWithItems[]>();

  const categories = categoriesData ?? [];
  const items = categories.flatMap((category) => category.budget_items);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Presupuesto</h1>
      <BudgetView
        eventId={event.id}
        totalBudget={event.total_budget}
        categories={categories}
        items={items}
      />
    </div>
  );
}
