import { z } from "zod";

export const rsvpSchema = z.object({
  attending: z.enum(["si", "no", "quizas"], { error: "Elige una opción" }),
  confirmed_plus_ones: z.number().int().nonnegative().optional(),
  dietary_notes: z.string().trim().max(300).optional(),
  message: z.string().trim().max(500).optional(),
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
