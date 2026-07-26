import { z } from "zod";

export const budgetItemSchema = z.object({
  description: z.string().trim().min(1, "Ponle una descripción").max(160),
  estimated: z
    .number({ error: "Tiene que ser un número" })
    .nonnegative("No puede ser negativo"),
  actual: z
    .number({ error: "Tiene que ser un número" })
    .nonnegative("No puede ser negativo"),
  vendor_id: z.string().trim().optional(),
});

export type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;
