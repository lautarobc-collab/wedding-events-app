import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre al evento").max(120),
  event_type: z.enum(["boda", "evento_generico"]),
  event_date: z.string().optional(),
  total_budget: z
    .number({ error: "Tiene que ser un número" })
    .nonnegative("No puede ser negativo")
    .optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
