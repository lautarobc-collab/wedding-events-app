import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { ProveedoresView } from "@/components/vendors/ProveedoresView";
import type { Category, VendorWithAttachments } from "@/lib/types";

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

  // Total gastado por categoría (suma de budget_items.actual), para el
  // resumen del directorio. Es una cifra orientativa a partir de los gastos
  // ya vinculados — Presupuesto sigue siendo la vista de referencia completa.
  const categoryIds = categories.map((c) => c.id);
  const { data: budgetItemsData } =
    categoryIds.length > 0
      ? await supabase.from("budget_items").select("category_id, actual").in("category_id", categoryIds)
      : { data: [] };
  const totalsByCategory = new Map<string, number>();
  for (const item of budgetItemsData ?? []) {
    totalsByCategory.set(item.category_id, (totalsByCategory.get(item.category_id) ?? 0) + item.actual);
  }

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
      <ProveedoresView
        eventId={event.id}
        categories={categories}
        totalsByCategory={totalsByCategory}
        signedUrlByPath={signedUrlByPath}
      />
    </div>
  );
}
