"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { CANONICAL_BUDGET_CATEGORIES } from "@/lib/budgetCategories";
import type { Category } from "@/lib/types";

export function NewCategoryForm({
  eventId,
  categories,
}: {
  eventId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingNames = new Set(categories.map((c) => c.name));
  const available = CANONICAL_BUDGET_CATEGORIES.filter((name) => !existingNames.has(name));

  async function addCategory(name: string) {
    setError(null);
    setPending(name);
    const result = await createCategory(eventId, name, categories.length);
    setPending(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setCustomName("");
    setCustomOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Añadir categoría</p>

      <div className="flex flex-wrap gap-2">
        {available.map((name) => (
          <button
            key={name}
            type="button"
            disabled={pending === name}
            onClick={() => addCategory(name)}
            className="rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:border-neutral-900 disabled:opacity-50"
          >
            + {name}
          </button>
        ))}
        {!customOpen && (
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="rounded-full border border-dashed border-neutral-300 px-3 py-1 text-sm text-neutral-500 hover:border-neutral-900"
          >
            + Otros
          </button>
        )}
      </div>

      {available.length === 0 && !customOpen && (
        <p className="text-sm text-neutral-400">
          Ya añadiste todas las categorías habituales — usa &quot;Otros&quot; para una específica.
        </p>
      )}

      {customOpen && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (customName.trim()) addCategory(customName.trim());
          }}
          className="flex items-end gap-2"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="custom-category-name" className="text-sm text-neutral-500">
              Nombre de la categoría
            </label>
            <input
              id="custom-category-name"
              autoFocus
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={!customName.trim() || pending === customName.trim()}
            className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            Añadir
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomOpen(false);
              setCustomName("");
            }}
            className="px-2 py-2 text-sm text-neutral-500"
          >
            Cancelar
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
