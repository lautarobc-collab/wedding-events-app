"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { formatMoney } from "@/lib/format";
import type { Category, BudgetItem } from "@/lib/types";
import { BudgetItemRow } from "./BudgetItemRow";
import { NewBudgetItemForm } from "./NewBudgetItemForm";
import { CategoryEditForm } from "./CategoryEditForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export function CategoryCard({
  eventId,
  category,
  items,
}: {
  eventId: string;
  category: Category;
  items: BudgetItem[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const subtotalEstimated = items.reduce((sum, i) => sum + i.estimated, 0);
  const subtotalActual = items.reduce((sum, i) => sum + i.actual, 0);

  return (
    <div className="rounded border border-neutral-200 p-4">
      {editing ? (
        <CategoryEditForm
          eventId={eventId}
          category={category}
          onDone={() => setEditing(false)}
        />
      ) : (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-medium">{category.name}</h2>
            <p className="text-sm text-neutral-500">
              Estimado categoría: {formatMoney(category.estimated_amount)} · Ítems:{" "}
              {formatMoney(subtotalEstimated)} est. / {formatMoney(subtotalActual)} real
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm text-neutral-600 underline"
            >
              Editar
            </button>
            <ConfirmDeleteButton
              confirmMessage={`¿Eliminar la categoría "${category.name}" y todos sus gastos? Esta acción no se puede deshacer.`}
              label="Eliminar categoría"
              onConfirm={async () => {
                await deleteCategory(category.id, eventId);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <BudgetItemRow key={item.id} eventId={eventId} item={item} />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-neutral-400">Sin gastos todavía.</p>
        )}
      </div>

      <NewBudgetItemForm eventId={eventId} categoryId={category.id} />
    </div>
  );
}
