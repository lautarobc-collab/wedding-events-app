import type { Category, BudgetItem, Event } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function BudgetSummary({
  totalBudget,
  categories,
  items,
}: {
  totalBudget: Event["total_budget"];
  categories: Category[];
  items: BudgetItem[];
}) {
  const estimated = categories.reduce((sum, c) => sum + c.estimated_amount, 0);
  const spent = items.reduce((sum, i) => sum + i.actual, 0);
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
        <dt className="text-sm text-neutral-500">Estimado por categorías</dt>
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
