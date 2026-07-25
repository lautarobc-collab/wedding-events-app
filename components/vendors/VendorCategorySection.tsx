import type { Category, Vendor } from "@/lib/types";
import { VendorCard } from "./VendorCard";
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

      {vendors.length > 0 ? (
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} eventId={eventId} vendor={vendor} />
          ))}
        </div>
      ) : (
        <p className="mb-3 text-sm text-neutral-400">Sin proveedores todavía.</p>
      )}

      <NewVendorForm eventId={eventId} categoryId={category.id} />
    </div>
  );
}
