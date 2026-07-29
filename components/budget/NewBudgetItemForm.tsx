"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBudgetItem } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import {
  budgetItemSchema,
  type BudgetItemFormValues,
} from "@/lib/validations/budgetItem";
import { getBudgetItemSuggestions } from "@/lib/budgetItemSuggestions";
import type { Vendor } from "@/lib/types";

export function NewBudgetItemForm({
  eventId,
  categoryId,
  categoryName,
  vendors,
  categoryNameById,
}: {
  eventId: string;
  categoryId: string;
  categoryName: string;
  vendors: Vendor[];
  categoryNameById: Map<string, string>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: { estimated: 0, actual: 0, vendor_id: "", expense_date: "" },
  });

  const suggestions = getBudgetItemSuggestions(categoryName);

  async function onSubmit(values: BudgetItemFormValues) {
    setServerError(null);
    const result = await createBudgetItem(categoryId, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({ description: "", estimated: 0, actual: 0, vendor_id: "", expense_date: "" });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nuevo gasto</label>
        <input
          placeholder="Descripción"
          {...register("description")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setValue("description", suggestion, { shouldValidate: true })}
                className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-100"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        )}
        {errors.description && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estimado</label>
        <input
          type="number"
          step="1"
          {...register("estimated", { valueAsNumber: true })}
          className="w-28 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Real</label>
        <input
          type="number"
          step="1"
          {...register("actual", { valueAsNumber: true })}
          className="w-28 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
      </div>
      {vendors.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm">Proveedor (opcional)</label>
          <select
            {...register("vendor_id")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          >
            <option value="">Ninguno</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
                {vendor.category_id !== categoryId
                  ? ` — ${categoryNameById.get(vendor.category_id) ?? ""}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm">Fecha del gasto (opcional)</label>
        <input
          type="date"
          {...register("expense_date")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-sm text-white dark:text-neutral-900 disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir"}
      </button>
      {serverError && <p className="w-full text-sm text-red-600 dark:text-red-400">{serverError}</p>}
    </form>
  );
}
