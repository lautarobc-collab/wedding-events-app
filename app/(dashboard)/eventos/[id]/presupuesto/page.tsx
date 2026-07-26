import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { BudgetView } from "@/components/budget/BudgetView";
import type { Category, BudgetItem, Vendor } from "@/lib/types";

type CategoryWithChildren = Category & { budget_items: BudgetItem[]; vendors: Vendor[] };

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
    .select("*, budget_items(*), vendors(*)")
    .eq("event_id", id)
    .order("sort_order", { ascending: true })
    .returns<CategoryWithChildren[]>();

  const categoriesRaw = categoriesData ?? [];
  const categories: Category[] = categoriesRaw;
  const items = categoriesRaw.flatMap((category) => category.budget_items);
  const chosenVendors = categoriesRaw
    .flatMap((category) => category.vendors)
    .filter((vendor) => vendor.status === "elegido");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Presupuesto</h1>
      <BudgetView
        eventId={event.id}
        totalBudget={event.total_budget}
        categories={categories}
        items={items}
        chosenVendors={chosenVendors}
      />
    </div>
  );
}
