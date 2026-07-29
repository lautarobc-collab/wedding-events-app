"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tableSchema, type TableFormValues } from "@/lib/validations/table";

export async function createTable(eventId: string, values: TableFormValues, sortOrder: number) {
  const parsed = tableSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("tables").insert({
    event_id: eventId,
    name: parsed.data.name,
    capacity: parsed.data.capacity,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/mesas`);
  return { success: true };
}

export async function updateTable(tableId: string, eventId: string, values: TableFormValues) {
  const parsed = tableSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tables")
    .update({ name: parsed.data.name, capacity: parsed.data.capacity })
    .eq("id", tableId);

  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/mesas`);
  return { success: true };
}

export async function deleteTable(tableId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tables").delete().eq("id", tableId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/mesas`);
  revalidatePath(`/eventos/${eventId}/invitados`);
}

export async function assignGuestTable(guestId: string, eventId: string, tableId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("guests").update({ table_id: tableId }).eq("id", guestId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/mesas`);
  revalidatePath(`/eventos/${eventId}/invitados`);
}
