"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";

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
  });

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
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
  const { error } = await supabase
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
    .eq("id", vendorId);

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  return { success: true };
}

export async function deleteVendor(vendorId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/presupuesto`);
}
