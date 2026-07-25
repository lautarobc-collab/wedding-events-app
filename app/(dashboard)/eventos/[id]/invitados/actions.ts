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
    plus_ones,
    children_count,
    dietary_restrictions,
    table_number,
  } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("guests").insert({
    event_id: eventId,
    first_name,
    last_name: last_name || null,
    email: email || null,
    invited_by: invited_by || null,
    plus_ones,
    children_count,
    dietary_restrictions: dietary_restrictions || null,
    table_number: table_number ?? null,
  });

  if (error) return { error: error.message };

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
    plus_ones,
    children_count,
    dietary_restrictions,
    table_number,
  } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({
      first_name,
      last_name: last_name || null,
      email: email || null,
      invited_by: invited_by || null,
      plus_ones,
      children_count,
      dietary_restrictions: dietary_restrictions || null,
      table_number: table_number ?? null,
    })
    .eq("id", guestId);

  if (error) return { error: error.message };

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
