"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations/category";
import {
  budgetItemSchema,
  type BudgetItemFormValues,
} from "@/lib/validations/budgetItem";

export async function createCategory(eventId: string, name: string, sortOrder: number) {
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) return { error: "Nombre inválido." };

  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    event_id: eventId,
    name: parsed.data.name,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function updateCategory(categoryId: string, eventId: string, name: string) {
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) return { error: "Nombre inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function deleteCategory(categoryId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}`);
}

export async function createBudgetItem(
  categoryId: string,
  eventId: string,
  values: BudgetItemFormValues,
) {
  const parsed = budgetItemSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { description, estimated, actual, vendor_id } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("budget_items").insert({
    category_id: categoryId,
    description,
    estimated,
    actual,
    vendor_id: vendor_id || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function updateBudgetItem(
  itemId: string,
  eventId: string,
  values: BudgetItemFormValues,
) {
  const parsed = budgetItemSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { description, estimated, actual, vendor_id } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("budget_items")
    .update({ description, estimated, actual, vendor_id: vendor_id || null })
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
}

export async function deleteBudgetItem(itemId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("budget_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/presupuesto`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}`);
}
