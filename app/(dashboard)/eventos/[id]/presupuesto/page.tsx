import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { CategoryCard } from "@/components/budget/CategoryCard";
import { NewCategoryForm } from "@/components/budget/NewCategoryForm";
import type { Category, BudgetItem } from "@/lib/types";

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
    .select("*")
    .eq("event_id", id)
    .order("sort_order", { ascending: true })
    .returns<Category[]>();

  const categories = categoriesData ?? [];
  const categoryIds = categories.map((category) => category.id);

  const { data: itemsData } = categoryIds.length
    ? await supabase
        .from("budget_items")
        .select("*")
        .in("category_id", categoryIds)
        .returns<BudgetItem[]>()
    : { data: [] as BudgetItem[] };

  const items = itemsData ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Presupuesto</h1>

      <BudgetSummary
        totalBudget={event.total_budget}
        categories={categories}
        items={items}
      />

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            eventId={event.id}
            category={category}
            items={items.filter((item) => item.category_id === category.id)}
          />
        ))}
      </div>

      <NewCategoryForm eventId={event.id} />
    </div>
  );
}
