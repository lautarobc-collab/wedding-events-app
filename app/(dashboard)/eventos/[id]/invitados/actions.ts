"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { guestSchema, type GuestFormValues } from "@/lib/validations/guest";

export async function createGuest(eventId: string, values: GuestFormValues) {
  const parsed = guestSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const {
    first_name,
    last_name,
    email,
    invited_by,
    dietary_restrictions,
    table_number,
    companions,
  } = parsed.data;

  const supabase = await createClient();
  const { data: guest, error } = await supabase
    .from("guests")
    .insert({
      event_id: eventId,
      first_name,
      last_name: last_name || null,
      email: email || null,
      invited_by: invited_by || null,
      dietary_restrictions: dietary_restrictions || null,
      table_number: table_number ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (companions.length > 0) {
    const { error: companionsError } = await supabase.from("guest_companions").insert(
      companions.map((companion) => ({
        guest_id: guest.id,
        name: companion.name || null,
        is_child: companion.is_child,
        dietary_restrictions: companion.dietary_restrictions || null,
      })),
    );
    if (companionsError) return { error: companionsError.message };
  }

  revalidatePath(`/eventos/${eventId}/invitados`);
  return { success: true };
}

export async function updateGuest(
  guestId: string,
  eventId: string,
  values: GuestFormValues,
) {
  const parsed = guestSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const {
    first_name,
    last_name,
    email,
    invited_by,
    dietary_restrictions,
    table_number,
    companions,
  } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({
      first_name,
      last_name: last_name || null,
      email: email || null,
      invited_by: invited_by || null,
      dietary_restrictions: dietary_restrictions || null,
      table_number: table_number ?? null,
    })
    .eq("id", guestId);

  if (error) return { error: error.message };

  // Los acompañantes se reemplazan enteros en cada edición en vez de
  // diferenciar altas/bajas/cambios: la lista es corta y así se evita
  // lógica de sincronización fila a fila para algo tan poco frecuente.
  const { error: deleteError } = await supabase
    .from("guest_companions")
    .delete()
    .eq("guest_id", guestId);
  if (deleteError) return { error: deleteError.message };

  if (companions.length > 0) {
    const { error: companionsError } = await supabase.from("guest_companions").insert(
      companions.map((companion) => ({
        guest_id: guestId,
        name: companion.name || null,
        is_child: companion.is_child,
        dietary_restrictions: companion.dietary_restrictions || null,
      })),
    );
    if (companionsError) return { error: companionsError.message };
  }

  revalidatePath(`/eventos/${eventId}/invitados`);
  return { success: true };
}

export async function deleteGuest(guestId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("guests").delete().eq("id", guestId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/invitados`);
}

export async function toggleThankYouSent(
  guestId: string,
  eventId: string,
  value: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({ thank_you_sent: value })
    .eq("id", guestId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/invitados`);
}
