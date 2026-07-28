import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { VendorCategorySection } from "@/components/vendors/VendorCategorySection";
import { NewVendorForm } from "@/components/vendors/NewVendorForm";
import type { Category, Vendor, VendorAttachment } from "@/lib/types";

type VendorWithAttachments = Vendor & { vendor_attachments: VendorAttachment[] };
type CategoryWithVendors = Category & { vendors: VendorWithAttachments[] };

export default async function VendorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return null;

  const supabase = await createClient();
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*, vendors(*, vendor_attachments(*))")
    .eq("event_id", id)
    .order("sort_order", { ascending: true })
    .returns<CategoryWithVendors[]>();

  const categories = categoriesData ?? [];
  const hasVendors = categories.some((category) => category.vendors.length > 0);

  const allPaths = categories.flatMap((category) =>
    category.vendors.flatMap((vendor) => vendor.vendor_attachments.map((a) => a.file_path)),
  );
  const signedUrlByPath = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("vendor-attachments")
      .createSignedUrls(allPaths, 60 * 60);
    for (const entry of signedUrls ?? []) {
      if (entry.path && entry.signedUrl) signedUrlByPath.set(entry.path, entry.signedUrl);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Proveedores</h1>

      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Todavía no hay categorías. Crea alguna en la pestaña Presupuesto.
        </p>
      ) : (
        <NewVendorForm eventId={event.id} categories={categories} />
      )}

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <VendorCategorySection
            key={category.id}
            eventId={event.id}
            category={category}
            vendors={category.vendors}
            signedUrlByPath={signedUrlByPath}
          />
        ))}
        {categories.length > 0 && !hasVendors && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Todavía no añadiste ningún proveedor.</p>
        )}
      </div>
    </div>
  );
}
