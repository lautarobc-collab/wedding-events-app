"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { createGuest } from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { createBudgetItem } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { createVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import type { Category } from "@/lib/types";

type QuickType = "tarea" | "invitado" | "gasto" | "proveedor";

const TABS: { key: QuickType; label: string; fieldLabel: string }[] = [
  { key: "tarea", label: "Tarea", fieldLabel: "Título" },
  { key: "invitado", label: "Invitado", fieldLabel: "Nombre" },
  { key: "gasto", label: "Gasto", fieldLabel: "Descripción" },
  { key: "proveedor", label: "Proveedor", fieldLabel: "Nombre" },
];

export function QuickAddPanel({
  eventId,
  categories,
}: {
  eventId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<QuickType>("tarea");
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const needsCategory = tab === "gasto" || tab === "proveedor";
  const activeTab = TABS.find((t) => t.key === tab)!;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || (needsCategory && !categoryId)) return;

    setIsSubmitting(true);
    setMessage(null);

    let result: { error?: string } | undefined;
    switch (tab) {
      case "tarea":
        result = await createTask(eventId, {
          title: text,
          due_date: "",
          status: "sin_empezar",
          notes: "",
        });
        break;
      case "invitado":
        result = await createGuest(eventId, {
          first_name: text,
          dietary_restrictions: "",
          companions: [],
        });
        break;
      case "gasto":
        result = await createBudgetItem(categoryId, eventId, {
          description: text,
          estimated: 0,
          actual: 0,
        });
        break;
      case "proveedor":
        result = await createVendor(categoryId, eventId, {
          name: text,
          status: "candidato",
        });
        break;
    }

    setIsSubmitting(false);

    if (result?.error) {
      setMessage(result.error);
      return;
    }

    setText("");
    setMessage("Añadido.");
    router.refresh();
  }

  return (
    <div className="rounded border border-neutral-200 p-4">
      <h2 className="mb-3 font-medium">Añadir rápido</h2>

      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setMessage(null);
            }}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === t.key
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 text-neutral-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {needsCategory && categories.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Todavía no hay categorías — créalas primero en la pestaña Presupuesto.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
          {needsCategory && (
            <div className="flex flex-col gap-1">
              <label className="text-sm">Categoría</label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="rounded border border-neutral-300 px-2 py-1"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm">{activeTab.fieldLabel}</label>
            <input
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="rounded border border-neutral-300 px-2 py-1"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Añadiendo..." : "Añadir"}
          </button>
          {message && <p className="w-full text-sm text-neutral-500">{message}</p>}
        </form>
      )}
    </div>
  );
}
