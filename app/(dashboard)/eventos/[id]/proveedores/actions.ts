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

  const { name, contact_phone, contact_email, website, estimated, actual, status, notes } =
    parsed.data;

  const supabase = await createClient();
  const { data: vendor, error } = await supabase
    .from("vendors")
    .insert({
      category_id: categoryId,
      name,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      website: website || null,
      estimated: estimated ?? null,
      actual: actual ?? null,
      status,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (status === "elegido") {
    const linkError = await ensureLinkedBudgetItem(
      supabase,
      vendor.id,
      categoryId,
      name,
      estimated,
      actual,
    );
    if (linkError) return { error: linkError.message };
  }

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

  const { name, contact_phone, contact_email, website, estimated, actual, status, notes } =
    parsed.data;

  const supabase = await createClient();
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
