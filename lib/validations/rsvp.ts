import { z } from "zod";

export const rsvpSchema = z
  .object({
    attending: z.enum(["si", "no", "quizas"], { error: "Elige una opción" }),
    confirmed_plus_ones: z.number().int().nonnegative().optional(),
    confirmed_children: z.number().int().nonnegative().optional(),
    dietary_notes: z.string().trim().max(300).optional(),
    message: z.string().trim().max(500).optional(),
    companion_names: z
      .array(z.object({ id: z.string(), name: z.string().trim().max(80).optional() }))
      .optional(),
  })
  .refine(
    (data) =>
      data.confirmed_children == null ||
      data.confirmed_children <= (data.confirmed_plus_ones ?? 0),
    {
      message: "No puede haber más niños que acompañantes confirmados",
      path: ["confirmed_children"],
    },
  );

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
