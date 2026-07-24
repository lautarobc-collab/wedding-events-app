"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateCategory,
  deleteCategory,
} from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { formatMoney } from "@/lib/format";
import type { Category, BudgetItem } from "@/lib/types";
import { BudgetItemRow } from "./BudgetItemRow";
import { NewBudgetItemForm } from "./NewBudgetItemForm";

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
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      estimated_amount: category.estimated_amount,
    },
  });

  const subtotalEstimated = items.reduce((sum, i) => sum + i.estimated, 0);
  const subtotalActual = items.reduce((sum, i) => sum + i.actual, 0);

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null);
    const result = await updateCategory(category.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDeleteCategory() {
    if (
      !confirm(
        `¿Eliminar la categoría "${category.name}" y todos sus gastos? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    await deleteCategory(category.id, eventId);
    router.refresh();
  }

  return (
    <div className="rounded border border-neutral-200 p-4">
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={`name-${category.id}`} className="text-sm font-medium">
              Nombre
            </label>
            <input
              id={`name-${category.id}`}
              {...register("name")}
              className="rounded border border-neutral-300 px-3 py-2"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`amount-${category.id}`} className="text-sm font-medium">
              Estimado
            </label>
            <input
              id={`amount-${category.id}`}
              type="number"
              step="0.01"
              {...register("estimated_amount", { valueAsNumber: true })}
              className="rounded border border-neutral-300 px-3 py-2"
            />
            {errors.estimated_amount && (
              <p className="text-sm text-red-600">{errors.estimated_amount.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            Cancelar
          </button>
          {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
        </form>
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
            <button
              type="button"
              onClick={handleDeleteCategory}
              className="text-sm text-red-600 underline"
            >
              Eliminar categoría
            </button>
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
