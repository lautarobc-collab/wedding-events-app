"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBudgetItem } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { formatMoney } from "@/lib/format";
import type { BudgetItem } from "@/lib/types";
import { BudgetItemEditForm } from "./BudgetItemEditForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export function BudgetItemRow({
  eventId,
  item,
}: {
  eventId: string;
  item: BudgetItem;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <BudgetItemEditForm eventId={eventId} item={item} onDone={() => setEditing(false)} />
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
        <ConfirmDeleteButton
          confirmMessage={`¿Eliminar "${item.description}"?`}
          onConfirm={async () => {
            await deleteBudgetItem(item.id, eventId);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
