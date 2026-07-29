import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Ponle un título").max(160),
  due_date: z.string().optional(),
  status: z.enum(["sin_empezar", "en_curso", "completado"]),
  notes: z.string().trim().max(500).optional(),
  recurrence: z.enum(["none", "weekly", "monthly"]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
