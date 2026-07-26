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
import type { BudgetItem, Vendor } from "@/lib/types";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";

export function BudgetItemRow({
  eventId,
  item,
  vendors,
}: {
  eventId: string;
  item: BudgetItem;
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      description: item.description,
      estimated: item.estimated,
      actual: item.actual,
      vendor_id: item.vendor_id ?? "",
    },
  });

  const linkedVendor = vendors.find((vendor) => vendor.id === item.vendor_id);

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

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2 text-sm">
      <InlineEditable
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onCommit={handleSubmit(onSubmit)}
        className="flex-1"
        display={
          <span>
            {item.description}
            {linkedVendor && (
              <span className="text-xs text-neutral-400"> · proveedor: {linkedVendor.name}</span>
            )}
          </span>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2">
          <input
            autoFocus
            {...register("description")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="number"
            step="1"
            placeholder="Estimado"
            {...register("estimated", { valueAsNumber: true })}
            className="w-24 rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="number"
            step="1"
            placeholder="Real"
            {...register("actual", { valueAsNumber: true })}
            className="w-24 rounded border border-neutral-300 px-2 py-1"
          />
          {vendors.length > 0 && (
            <select
              {...register("vendor_id")}
              className="rounded border border-neutral-300 px-2 py-1"
            >
              <option value="">Sin proveedor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          )}
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </form>
      </InlineEditable>

      {!editing && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-neutral-500">
            {formatMoney(item.estimated)} est. / {formatMoney(item.actual)} real
          </span>
          <ConfirmDeleteButton
            confirmMessage={`¿Eliminar "${item.description}"?`}
            onConfirm={async () => {
              await deleteBudgetItem(item.id, eventId);
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
