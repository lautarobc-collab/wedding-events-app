"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";

// Si el proveedor pasa a "elegido" y todavía no tiene ningún gasto vinculado,
// se crea uno automáticamente (con su nombre y estimado/real) en vez de dejar
// que cuente como un total invisible en Presupuesto. Así el proveedor→gasto
// queda conectado sin que el usuario tenga que acordarse de vincularlo a
// mano, sin forzar un proveedor obligatorio en cada gasto manual.
async function ensureLinkedBudgetItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vendorId: string,
  categoryId: string,
  name: string,
  estimated: number | null | undefined,
  actual: number | null | undefined,
) {
  const { data: existingLink } = await supabase
    .from("budget_items")
    .select("id")
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (existingLink) return null;

  const { error } = await supabase.from("budget_items").insert({
    category_id: categoryId,
    description: name,
    estimated: estimated ?? 0,
    actual: actual ?? 0,
    vendor_id: vendorId,
  });

  return error;
}

export async function createVendor(
  categoryId: string,
  eventId: string,
  values: VendorFormValues,
) {
  const parsed = vendorSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { name, contact_phone, contact_email, website, estimated, actual, status, notes, rating } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").insert({
    category_id: categoryId,
    name,
    contact_phone: contact_phone || null,
    contact_email: contact_email || null,
    website: website || null,
    estimated: estimated ?? null,
    actual: actual ?? null,
    status,
    notes: notes || null,
    rating: rating ?? null,
  });

  if (error) return { error: error.message };

  // A propósito, aquí NO se crea el gasto vinculado aunque el estado ya sea
  // "elegido" — eso solo pasa al editar la ficha después (ver updateVendor),
  // para no generar una línea en Presupuesto antes de que el usuario termine
  // de crear el proveedor.
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function updateVendor(
  vendorId: string,
  eventId: string,
  values: VendorFormValues,
) {
  const parsed = vendorSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { name, contact_phone, contact_email, website, estimated, actual, status, notes, rating } =
    parsed.data;

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("vendors")
    .select("status")
    .eq("id", vendorId)
    .maybeSingle();
  const wasElegido = before?.status === "elegido";

  const { data: vendor, error } = await supabase
    .from("vendors")
    .update({
      name,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      website: website || null,
      estimated: estimated ?? null,
      actual: actual ?? null,
      status,
      notes: notes || null,
      rating: rating ?? null,
    })
    .eq("id", vendorId)
    .select("category_id")
    .single();

  if (error) return { error: error.message };

  if (status === "elegido") {
    const linkError = await ensureLinkedBudgetItem(
      supabase,
      vendorId,
      vendor.category_id,
      name,
      estimated,
      actual,
    );
    if (linkError) return { error: linkError.message };
  } else if (wasElegido) {
    // Deja de estar "elegido": el gasto vinculado se conserva (no se borra
    // dinero sin que lo pidan explícitamente), solo pierde la referencia
    // al proveedor y pasa a ser una línea manual.
    const { error: unlinkError } = await supabase
      .from("budget_items")
      .update({ vendor_id: null })
      .eq("vendor_id", vendorId);
    if (unlinkError) return { error: unlinkError.message };
  }

  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function setVendorArchived(vendorId: string, eventId: string, archived: boolean) {
  const supabase = await createClient();

  const { data: vendor, error: fetchError } = await supabase
    .from("vendors")
    .select("status, category_id, name, estimated, actual")
    .eq("id", vendorId)
    .single();
  if (fetchError) return { error: fetchError.message };

  const { error } = await supabase.from("vendors").update({ archived }).eq("id", vendorId);
  if (error) return { error: error.message };

  if (archived) {
    // Archivar oculta al proveedor de la vista activa; cualquier gasto que
    // lo referenciara se desvincula (no se borra), igual que al cambiar de
    // estado — nunca se borra dinero sin que lo pidan explícitamente.
    const { error: unlinkError } = await supabase
      .from("budget_items")
      .update({ vendor_id: null })
      .eq("vendor_id", vendorId);
    if (unlinkError) return { error: unlinkError.message };
  } else if (vendor.status === "elegido") {
    // Al desarchivar un proveedor que sigue "elegido", se restaura su
    // línea de presupuesto si no quedó ninguna vinculada.
    const linkError = await ensureLinkedBudgetItem(
      supabase,
      vendorId,
      vendor.category_id,
      vendor.name,
      vendor.estimated,
      vendor.actual,
    );
    if (linkError) return { error: linkError.message };
  }

  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function deleteVendor(vendorId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}`);
}

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export async function uploadVendorAttachment(vendorId: string, eventId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elige un archivo." };
  }
  if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
    return { error: "Solo se admiten PDF o imágenes (PNG, JPEG, WEBP)." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { error: "El archivo pesa demasiado (máximo 10 MB)." };
  }

  const supabase = await createClient();
  const filePath = `${vendorId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("vendor-attachments")
    .upload(filePath, file, { contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("vendor_attachments").insert({
    vendor_id: vendorId,
    file_path: filePath,
    file_name: file.name,
    content_type: file.type,
    size_bytes: file.size,
  });
  if (insertError) {
    await supabase.storage.from("vendor-attachments").remove([filePath]);
    return { error: insertError.message };
  }

  revalidatePath(`/eventos/${eventId}/proveedores`);
  return { success: true };
}

export async function deleteVendorAttachment(
  attachmentId: string,
  filePath: string,
  eventId: string,
) {
  const supabase = await createClient();
  const { error: storageError } = await supabase.storage
    .from("vendor-attachments")
    .remove([filePath]);
  if (storageError) return { error: storageError.message };

  const { error } = await supabase.from("vendor_attachments").delete().eq("id", attachmentId);
  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/proveedores`);
  return { success: true };
}
