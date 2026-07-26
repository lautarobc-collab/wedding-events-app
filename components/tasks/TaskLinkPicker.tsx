import type {
  TaskLinkBudgetItem,
  TaskLinkCategory,
  TaskLinkGuest,
  TaskLinkKind,
  TaskLinkVendor,
} from "@/lib/taskLinks";

export function TaskLinkPicker({
  kind,
  onKindChange,
  refId,
  onRefIdChange,
  guests,
  budgetItems,
  vendors,
  categories,
}: {
  kind: "" | TaskLinkKind;
  onKindChange: (kind: "" | TaskLinkKind) => void;
  refId: string;
  onRefIdChange: (refId: string) => void;
  guests: TaskLinkGuest[];
  budgetItems: TaskLinkBudgetItem[];
  vendors: TaskLinkVendor[];
  categories: TaskLinkCategory[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm">Vincular a</label>
        <select
          value={kind}
          onChange={(event) => {
            onKindChange(event.target.value as "" | TaskLinkKind);
            onRefIdChange("");
          }}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="">Nada</option>
          <option value="guest">Invitado</option>
          <option value="budget_item_or_vendor">Gasto o proveedor</option>
          <option value="category">Categoría</option>
        </select>
      </div>

      {kind === "guest" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm">Invitado</label>
          <select
            value={refId}
            onChange={(event) => onRefIdChange(event.target.value)}
            className="rounded border border-neutral-300 px-2 py-1"
          >
            <option value="">Elige uno</option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {[guest.first_name, guest.last_name].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {kind === "budget_item_or_vendor" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm">Gasto o proveedor</label>
          <select
            value={refId}
            onChange={(event) => onRefIdChange(event.target.value)}
            className="rounded border border-neutral-300 px-2 py-1"
          >
            <option value="">Elige uno</option>
            {budgetItems.map((item) => (
              <option key={item.id} value={`budget_item:${item.id}`}>
                Gasto: {item.description}
              </option>
            ))}
            {vendors.map((vendor) => (
              <option key={vendor.id} value={`vendor:${vendor.id}`}>
                Proveedor: {vendor.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {kind === "category" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm">Categoría</label>
          <select
            value={refId}
            onChange={(event) => onRefIdChange(event.target.value)}
            className="rounded border border-neutral-300 px-2 py-1"
          >
            <option value="">Elige una</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
