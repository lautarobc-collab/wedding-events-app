import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la categoría").max(80),
  estimated_amount: z
    .number({ error: "Tiene que ser un número" })
    .nonnegative("No puede ser negativo"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const newCategorySchema = categorySchema.pick({ name: true });

export type NewCategoryFormValues = z.infer<typeof newCategorySchema>;
