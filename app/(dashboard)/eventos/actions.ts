"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import { buildDefaultTasks } from "@/lib/defaultTasks";
import { generateSlug } from "@/lib/slug";

export async function createEvent(values: EventFormValues) {
  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { name, event_type, event_date, total_budget } = parsed.data;

  const { data: newEvent, error } = await supabase
    .from("events")
    .insert({
      owner_id: user.id,
      name,
      event_type,
      event_date: event_date || null,
      total_budget: total_budget ?? null,
      public_slug: generateSlug(name),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const defaultTasks = buildDefaultTasks(event_type, event_date || null).map((task) => ({
    ...task,
    event_id: newEvent.id,
  }));

  const { error: tasksError } = await supabase.from("tasks").insert(defaultTasks);

  if (tasksError) return { error: tasksError.message };

  revalidatePath("/");
  return { success: true };
}

export async function updateEvent(eventId: string, values: EventFormValues) {
  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { name, event_type, event_date, location, total_budget } = parsed.data;

  const { error } = await supabase
    .from("events")
    .update({
      name,
      event_type,
      event_date: event_date || null,
      location: location || null,
      total_budget: total_budget ?? null,
    })
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function setSummarySharing(eventId: string, enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ summary_public_token: enabled ? crypto.randomUUID() : null })
    .eq("id", eventId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };
  revalidatePath("/");
}
