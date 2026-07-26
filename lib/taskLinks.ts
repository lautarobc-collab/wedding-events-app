export type TaskLinkKind = "guest" | "budget_item_or_vendor" | "category";

export type TaskLinkColumns = {
  guest_id: string | null;
  budget_item_id: string | null;
  vendor_id: string | null;
  category_id: string | null;
};

const emptyLink: TaskLinkColumns = {
  guest_id: null,
  budget_item_id: null,
  vendor_id: null,
  category_id: null,
};

// refId codifica el id según el tipo elegido: para "budget_item_or_vendor"
// viene prefijado ("budget_item:<id>" | "vendor:<id>") porque comparten un
// mismo selector; para "guest"/"category" es el id sin prefijo.
export function resolveTaskLink(kind: "" | TaskLinkKind, refId: string): TaskLinkColumns {
  if (!kind || !refId) return emptyLink;
  if (kind === "guest") return { ...emptyLink, guest_id: refId };
  if (kind === "category") return { ...emptyLink, category_id: refId };

  const [prefix, id] = refId.split(":");
  if (prefix === "budget_item" && id) return { ...emptyLink, budget_item_id: id };
  if (prefix === "vendor" && id) return { ...emptyLink, vendor_id: id };
  return emptyLink;
}

export function taskLinkToKindAndRef(task: TaskLinkColumns): {
  kind: "" | TaskLinkKind;
  refId: string;
} {
  if (task.guest_id) return { kind: "guest", refId: task.guest_id };
  if (task.category_id) return { kind: "category", refId: task.category_id };
  if (task.budget_item_id) {
    return { kind: "budget_item_or_vendor", refId: `budget_item:${task.budget_item_id}` };
  }
  if (task.vendor_id) {
    return { kind: "budget_item_or_vendor", refId: `vendor:${task.vendor_id}` };
  }
  return { kind: "", refId: "" };
}

export type TaskLinkGuest = { id: string; first_name: string; last_name: string | null };
export type TaskLinkBudgetItem = { id: string; description: string };
export type TaskLinkVendor = { id: string; name: string };
export type TaskLinkCategory = { id: string; name: string };

export function describeTaskLink(
  task: TaskLinkColumns,
  eventId: string,
  data: {
    guests: TaskLinkGuest[];
    budgetItems: TaskLinkBudgetItem[];
    vendors: TaskLinkVendor[];
    categories: TaskLinkCategory[];
  },
): { label: string; href: string } | null {
  if (task.guest_id) {
    const guest = data.guests.find((g) => g.id === task.guest_id);
    if (!guest) return null;
    return {
      label: `Invitado: ${[guest.first_name, guest.last_name].filter(Boolean).join(" ")}`,
      href: `/eventos/${eventId}/invitados`,
    };
  }
  if (task.budget_item_id) {
    const item = data.budgetItems.find((b) => b.id === task.budget_item_id);
    if (!item) return null;
    return { label: `Gasto: ${item.description}`, href: `/eventos/${eventId}/presupuesto` };
  }
  if (task.vendor_id) {
    const vendor = data.vendors.find((v) => v.id === task.vendor_id);
    if (!vendor) return null;
    return { label: `Proveedor: ${vendor.name}`, href: `/eventos/${eventId}/proveedores` };
  }
  if (task.category_id) {
    const category = data.categories.find((c) => c.id === task.category_id);
    if (!category) return null;
    return { label: `Categoría: ${category.name}`, href: `/eventos/${eventId}/presupuesto` };
  }
  return null;
}
