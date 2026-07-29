import { z } from "zod";

export const tableSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre").max(80),
  capacity: z.number({ error: "Tiene que ser un número" }).int().positive(),
});

export type TableFormValues = z.infer<typeof tableSchema>;
