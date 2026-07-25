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
    estimated_amount: 0,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
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
  return { success: true };
}

export async function deleteCategory(categoryId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/presupuesto`);
}

export async function createBudgetItem(
  categoryId: string,
  eventId: string,
  values: BudgetItemFormValues,
) {
  const parsed = budgetItemSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("budget_items").insert({
    category_id: categoryId,
    ...parsed.data,
  });

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
  return { success: true };
}

export async function updateBudgetItem(
  itemId: string,
  eventId: string,
  values: BudgetItemFormValues,
) {
  const parsed = budgetItemSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("budget_items")
    .update(parsed.data)
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath(`/eventos/${eventId}/presupuesto`);
  return { success: true };
}

export async function deleteBudgetItem(itemId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("budget_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(`/eventos/${eventId}/presupuesto`);
}
