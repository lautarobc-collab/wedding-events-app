import type { BudgetItem, Vendor } from "@/lib/types";

// Un proveedor "elegido" cuenta como gasto de su categoría junto a las líneas
// de budget_items (ver migración 0005_vendor_budget_merge). BudgetSummary,
// BudgetChart y CategoryCard necesitan el mismo total estimado/real a partir
// de las mismas dos listas, así que vive en un único sitio en vez de
// repetirse en cada componente.
export function sumBudget(items: BudgetItem[], chosenVendors: Vendor[]) {
  const estimated =
    items.reduce((sum, item) => sum + item.estimated, 0) +
    chosenVendors.reduce((sum, vendor) => sum + (vendor.estimated ?? 0), 0);
  const actual =
    items.reduce((sum, item) => sum + item.actual, 0) +
    chosenVendors.reduce((sum, vendor) => sum + (vendor.actual ?? 0), 0);
  return { estimated, actual };
}
