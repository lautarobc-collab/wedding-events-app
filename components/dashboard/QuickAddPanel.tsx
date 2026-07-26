"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { createGuest } from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { createBudgetItem } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { createVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import type { Category } from "@/lib/types";

type QuickType = "tarea" | "invitado" | "gasto" | "proveedor";

type QuickGuest = { id: string; first_name: string; last_name: string | null };
type QuickTask = { id: string; title: string };
type QuickBudgetItem = { id: string; category_id: string; description: string };
type QuickVendor = { id: string; category_id: string; name: string };

const TABS: {
  key: QuickType;
  label: string;
  fieldLabel: string;
  subtitle: string;
  route: string;
  routeLabel: string;
}[] = [
  {
    key: "tarea",
    label: "Tarea",
    fieldLabel: "Título",
    subtitle: "Un pendiente en tu checklist.",
    route: "tareas",
    routeLabel: "Tareas",
  },
  {
    key: "invitado",
    label: "Invitado",
    fieldLabel: "Nombre",
    subtitle: "Una persona en tu lista de invitados.",
    route: "invitados",
    routeLabel: "Invitados",
  },
  {
    key: "gasto",
    label: "Gasto",
    fieldLabel: "Descripción",
    subtitle: "Un coste ya decidido, dentro de una categoría del presupuesto.",
    route: "presupuesto",
    routeLabel: "Presupuesto",
  },
  {
    key: "proveedor",
    label: "Proveedor",
    fieldLabel: "Nombre",
    subtitle: "Una empresa que estás evaluando para una categoría.",
    route: "proveedores",
    routeLabel: "Proveedores",
  },
];

export function QuickAddPanel({
  eventId,
  categories,
  guests,
  tasks,
  budgetItems,
  vendors,
}: {
  eventId: string;
  categories: Category[];
  guests: QuickGuest[];
  tasks: QuickTask[];
  budgetItems: QuickBudgetItem[];
  vendors: QuickVendor[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<QuickType>("tarea");
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

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
          estimated: amount ? Number(amount) : 0,
          actual: 0,
        });
        break;
      case "proveedor":
        result = await createVendor(categoryId, eventId, {
          name: text,
          contact_phone: phone || undefined,
          status: "candidato",
        });
        break;
    }

    setIsSubmitting(false);

    if (result?.error) {
      setMessage({ text: result.error, isError: true });
      return;
    }

    setMessage({ text: `${activeTab.label} "${text}" añadido.`, isError: false });
    setText("");
    setAmount("");
    setPhone("");
    router.refresh();
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const preview = (() => {
    if (tab === "tarea") {
      return { label: "tarea", labelPlural: "tareas", items: tasks.map((t) => t.title), scoped: false };
    }
    if (tab === "invitado") {
      return {
        label: "invitado",
        labelPlural: "invitados",
        items: guests.map((g) => [g.first_name, g.last_name].filter(Boolean).join(" ")),
        scoped: false,
      };
    }
    if (tab === "gasto") {
      const items = budgetItems
        .filter((item) => item.category_id === categoryId)
        .map((item) => item.description);
      return { label: "gasto", labelPlural: "gastos", items, scoped: true };
    }
    const items = vendors
      .filter((vendor) => vendor.category_id === categoryId)
      .map((vendor) => vendor.name);
    return { label: "proveedor", labelPlural: "proveedores", items, scoped: true };
  })();

  const showPreview = !needsCategory || Boolean(categoryId);

  return (
    <div className="rounded border border-neutral-200 p-4">
      <h2 className="mb-3 font-medium">Añadir rápido</h2>

      <div className="mb-1 flex flex-wrap gap-2">
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
      <p className="mb-3 text-sm text-neutral-500">{activeTab.subtitle}</p>

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
          {tab === "gasto" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm">Importe estimado (€)</label>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-28 rounded border border-neutral-300 px-2 py-1"
              />
            </div>
          )}
          {tab === "proveedor" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm">Teléfono</label>
              <input
                type="tel"
                placeholder="Opcional"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-36 rounded border border-neutral-300 px-2 py-1"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Añadiendo..." : "Añadir"}
          </button>
          {message && (
            <p
              className={`w-full text-sm ${message.isError ? "text-red-600" : "text-neutral-600"}`}
            >
              {message.text}
              {!message.isError && (
                <>
                  {" "}
                  <Link href={`/eventos/${eventId}/${activeTab.route}`} className="underline">
                    Ver en {activeTab.routeLabel} →
                  </Link>
                </>
              )}
            </p>
          )}
        </form>
      )}

      {showPreview && (
        <p className="mt-3 text-xs text-neutral-400">
          {preview.items.length === 0
            ? preview.scoped && selectedCategory
              ? `Todavía no hay ${preview.labelPlural} en "${selectedCategory.name}".`
              : `Todavía no hay ${preview.labelPlural}.`
            : `${preview.scoped && selectedCategory ? `En "${selectedCategory.name}"` : "Ya tienes"} ${preview.items.length} ${
                preview.items.length === 1 ? preview.label : preview.labelPlural
              }: ${preview.items.slice(0, 3).join(", ")}${
                preview.items.length > 3 ? `, +${preview.items.length - 3} más` : ""
              }.`}
        </p>
      )}
    </div>
  );
}
