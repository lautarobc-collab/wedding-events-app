import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la categoría").max(80),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
