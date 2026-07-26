import type { BudgetItem, Event, Vendor } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { sumBudget } from "@/lib/budget";

export function BudgetSummary({
  totalBudget,
  items,
  chosenVendors,
}: {
  totalBudget: Event["total_budget"];
  items: BudgetItem[];
  chosenVendors: Vendor[];
}) {
  const { estimated, actual: spent } = sumBudget(items, chosenVendors);
  const remaining = (totalBudget ?? estimated) - spent;

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Presupuesto total</dt>
        <dd className="font-medium">
          {totalBudget != null ? formatMoney(totalBudget) : "Sin definir"}
        </dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Estimado (todos los gastos)</dt>
        <dd className="font-medium">{formatMoney(estimated)}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Gastado real</dt>
        <dd className="font-medium">{formatMoney(spent)}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Restante</dt>
        <dd className={`font-medium ${remaining < 0 ? "text-red-600" : ""}`}>
          {formatMoney(remaining)}
        </dd>
      </div>
    </dl>
  );
}
