"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategory, deleteCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { formatMoney } from "@/lib/format";
import type { Category, BudgetItem } from "@/lib/types";
import { BudgetItemRow } from "./BudgetItemRow";
import { NewBudgetItemForm } from "./NewBudgetItemForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";

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
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category.name },
  });

  const estimated = items.reduce((sum, i) => sum + i.estimated, 0);
  const actual = items.reduce((sum, i) => sum + i.actual, 0);

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null);
    const result = await updateCategory(category.id, eventId, values.name);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="rounded border border-neutral-200 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1">
          <InlineEditable
            editing={editing}
            onStartEdit={() => setEditing(true)}
            onCancel={() => setEditing(false)}
            onCommit={handleSubmit(onSubmit)}
            display={<h2 className="font-medium">{category.name}</h2>}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">
              <input
                autoFocus
                {...register("name")}
                className="rounded border border-neutral-300 px-2 py-1 font-medium"
              />
              <p className="text-xs text-neutral-400">Enter para guardar · Esc para cancelar</p>
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              {serverError && <p className="text-sm text-red-600">{serverError}</p>}
            </form>
          </InlineEditable>
          <p className="text-sm text-neutral-500">
            Estimado: {formatMoney(estimated)} · Gastado: {formatMoney(actual)}
          </p>
        </div>
        <ConfirmDeleteButton
          confirmMessage={`¿Eliminar la categoría "${category.name}" y todos sus gastos? Esta acción no se puede deshacer.`}
          label="Eliminar categoría"
          onConfirm={async () => {
            await deleteCategory(category.id, eventId);
            router.refresh();
          }}
        />
      </div>

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
