"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { getCanonicalCategories } from "@/lib/budgetCategories";
import type { Category, EventType } from "@/lib/types";

export function NewCategoryForm({
  eventId,
  eventType,
  categories,
}: {
  eventId: string;
  eventType: EventType;
  categories: Category[];
}) {
  const router = useRouter();
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingNames = new Set(categories.map((c) => c.name));
  const available = getCanonicalCategories(eventType).filter((name) => !existingNames.has(name));

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
            className="rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-sm text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-neutral-100 disabled:opacity-50"
          >
            + {name}
          </button>
        ))}
        {!customOpen && (
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-100"
          >
            + Otros
          </button>
        )}
      </div>

      {available.length === 0 && !customOpen && (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
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
            <label htmlFor="custom-category-name" className="text-sm text-neutral-500 dark:text-neutral-400">
              Nombre de la categoría
            </label>
            <input
              id="custom-category-name"
              autoFocus
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={!customName.trim() || pending === customName.trim()}
            className="rounded bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-white dark:text-neutral-900 disabled:opacity-50"
          >
            Añadir
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomOpen(false);
              setCustomName("");
            }}
            className="px-2 py-2 text-sm text-neutral-500 dark:text-neutral-400"
          >
            Cancelar
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
