"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";

export async function createTask(eventId: string, values: TaskFormValues) {
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { title, due_date, status, notes } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    event_id: eventId,
    title,
    due_date: due_date || null,
    status,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/tareas`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function updateTask(
  taskId: string,
  eventId: string,
  values: TaskFormValues,
) {
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { title, due_date, status, notes } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      due_date: due_date || null,
      status,
      notes: notes || null,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/tareas`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function deleteTask(taskId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/tareas`);
  revalidatePath(`/eventos/${eventId}`);
}
