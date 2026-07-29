"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import type { TaskLinkColumns } from "@/lib/taskLinks";
import { nextDueDate } from "@/lib/taskRecurrence";

const noLink: TaskLinkColumns = {
  guest_id: null,
  budget_item_id: null,
  vendor_id: null,
  category_id: null,
};

export async function createTask(
  eventId: string,
  values: TaskFormValues,
  link: TaskLinkColumns = noLink,
) {
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { title, due_date, status, notes, recurrence } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    event_id: eventId,
    title,
    due_date: due_date || null,
    status,
    notes: notes || null,
    recurrence,
    ...link,
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
  link: TaskLinkColumns = noLink,
) {
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { title, due_date, status, notes, recurrence } = parsed.data;

  const supabase = await createClient();
  const { data: previous } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", taskId)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      due_date: due_date || null,
      status,
      notes: notes || null,
      recurrence,
      ...link,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };

  const justCompleted = status === "completado" && previous?.status !== "completado";
  if (justCompleted && recurrence !== "none") {
    const { error: nextError } = await supabase.from("tasks").insert({
      event_id: eventId,
      title,
      due_date: nextDueDate(due_date, recurrence),
      status: "sin_empezar",
      notes: notes || null,
      recurrence,
      ...link,
    });
    if (nextError) return { error: nextError.message };
  }

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
