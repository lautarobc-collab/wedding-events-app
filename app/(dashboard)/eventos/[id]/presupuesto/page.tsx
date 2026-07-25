import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { CategoryCard } from "@/components/budget/CategoryCard";
import { NewCategoryForm } from "@/components/budget/NewCategoryForm";
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

      <BudgetSummary totalBudget={event.total_budget} items={items} />

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            eventId={event.id}
            category={category}
            items={category.budget_items}
          />
        ))}
      </div>

      <NewCategoryForm eventId={event.id} nextSortOrder={categories.length} />
    </div>
  );
}
