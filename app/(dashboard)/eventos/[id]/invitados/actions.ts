"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { guestSchema, type GuestFormValues } from "@/lib/validations/guest";
import { parseGuestCsv } from "@/lib/importGuests";
import type { AttendingStatus, InvitationStatus } from "@/lib/types";

export async function createGuest(eventId: string, values: GuestFormValues) {
  const parsed = guestSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const {
    first_name,
    last_name,
    email,
    invited_by,
    dietary_restrictions,
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
  revalidatePath(`/eventos/${eventId}`);
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
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function importGuests(
  eventId: string,
  rawText: string,
): Promise<{ ok: false; error: string } | { ok: true; imported: number; skipped: number }> {
  const { rows, skipped } = parseGuestCsv(rawText);
  if (rows.length === 0) {
    return { ok: false, error: "No se encontraron invitados válidos para importar." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("guests").insert(
    rows.map((row) => ({
      event_id: eventId,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      invited_by: row.invited_by,
    })),
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/eventos/${eventId}/invitados`);
  revalidatePath(`/eventos/${eventId}`);
  return { ok: true, imported: rows.length, skipped };
}

export async function deleteGuest(guestId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("guests").delete().eq("id", guestId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/invitados`);
  revalidatePath(`/eventos/${eventId}`);
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

export async function setInvitationStatus(
  guestId: string,
  eventId: string,
  status: InvitationStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({ invitation_status: status })
    .eq("id", guestId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/invitados`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

// Registra la respuesta como si el invitado la hubiera dado él mismo en el
// RSVP público (misma tabla, mismo criterio para el estado más reciente):
// permite confirmar desde el panel sin esperar a que responda por su cuenta.
export async function setGuestAttending(
  guestId: string,
  eventId: string,
  attending: AttendingStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("rsvp_responses").insert({
    guest_id: guestId,
    attending,
  });
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/invitados`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}
