"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rsvpSchema, type RsvpFormValues } from "@/lib/validations/rsvp";

export async function submitRsvp(
  slug: string,
  guestId: string,
  values: RsvpFormValues,
) {
  const parsed = rsvpSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_rsvp", {
    p_slug: slug,
    p_guest_id: guestId,
    p_attending: parsed.data.attending,
    p_confirmed_plus_ones: parsed.data.confirmed_plus_ones ?? 0,
    p_confirmed_children: parsed.data.confirmed_children ?? 0,
    p_dietary_notes: parsed.data.dietary_notes || null,
    p_message: parsed.data.message || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/rsvp/${slug}/${guestId}`);
  return { success: true };
}
