import type { Category, Vendor } from "@/lib/types";
import { VendorRow } from "./VendorRow";
import { NewVendorForm } from "./NewVendorForm";

export function VendorCategorySection({
  eventId,
  category,
  vendors,
}: {
  eventId: string;
  category: Category;
  vendors: Vendor[];
}) {
  return (
    <div className="rounded border border-neutral-200 p-4">
      <h2 className="mb-3 font-medium">{category.name}</h2>

      <div className="flex flex-col gap-2">
        {vendors.map((vendor) => (
          <VendorRow key={vendor.id} eventId={eventId} vendor={vendor} />
        ))}
        {vendors.length === 0 && (
          <p className="text-sm text-neutral-400">Sin proveedores todavía.</p>
        )}
      </div>

      <NewVendorForm eventId={eventId} categoryId={category.id} />
    </div>
  );
}
