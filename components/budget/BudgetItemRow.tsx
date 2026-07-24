"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateBudgetItem,
  deleteBudgetItem,
} from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import {
  budgetItemSchema,
  type BudgetItemFormValues,
} from "@/lib/validations/budgetItem";
import { formatMoney } from "@/lib/format";
import type { BudgetItem } from "@/lib/types";

export function BudgetItemRow({
  eventId,
  item,
}: {
  eventId: string;
  item: BudgetItem;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      description: item.description,
      estimated: item.estimated,
      actual: item.actual,
    },
  });

  async function onSubmit(values: BudgetItemFormValues) {
    setServerError(null);
    const result = await updateBudgetItem(item.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${item.description}"?`)) return;
    await deleteBudgetItem(item.id, eventId);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap items-end gap-2 rounded bg-neutral-50 p-2"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm">Descripción</label>
          <input
            {...register("description")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Estimado</label>
          <input
            type="number"
            step="0.01"
            {...register("estimated", { valueAsNumber: true })}
            className="w-28 rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Real</label>
          <input
            type="number"
            step="0.01"
            {...register("actual", { valueAsNumber: true })}
            className="w-28 rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Cancelar
        </button>
        {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-2 text-sm">
      <span>{item.description}</span>
      <div className="flex items-center gap-3">
        <span className="text-neutral-500">
          {formatMoney(item.estimated)} est. / {formatMoney(item.actual)} real
        </span>
        <button type="button" onClick={() => setEditing(true)} className="underline">
          Editar
        </button>
        <button type="button" onClick={handleDelete} className="text-red-600 underline">
          Eliminar
        </button>
      </div>
    </div>
  );
}
