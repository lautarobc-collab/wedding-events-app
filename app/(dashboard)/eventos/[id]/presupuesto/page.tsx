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
  // Los proveedores archivados no aparecen como opción para vincular un
  // gasto ni cuentan aparte en el fallback de "proveedor elegido" de abajo.
  const vendors = categoriesRaw.flatMap((category) => category.vendors).filter((v) => !v.archived);
  // Un proveedor "elegido" con un gasto ya vinculado EN SU PROPIA CATEGORÍA
  // no se vuelve a sumar aparte: el gasto vinculado es el que manda, para no
  // contar el mismo coste dos veces. Importante: se comprueba por categoría,
  // no solo por vendor_id — un proveedor puede estar vinculado a mano a un
  // gasto de otra categoría (#64) sin que eso cubra su propia línea de
  // "elegido".
  const chosenVendors = vendors.filter(
    (vendor) =>
      vendor.status === "elegido" &&
      !items.some((item) => item.vendor_id === vendor.id && item.category_id === vendor.category_id),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Presupuesto</h1>
      <BudgetView
        eventId={event.id}
        eventType={event.event_type}
        totalBudget={event.total_budget}
        categories={categories}
        items={items}
        vendors={vendors}
        chosenVendors={chosenVendors}
      />
    </div>
  );
}
