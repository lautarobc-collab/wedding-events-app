import { z } from "zod";

export const companionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().max(80).optional(),
  is_child: z.boolean(),
  dietary_restrictions: z.string().trim().max(300).optional(),
});

export type CompanionFormValues = z.infer<typeof companionSchema>;

export const guestSchema = z.object({
  first_name: z.string().trim().min(1, "Ponle un nombre").max(80),
  last_name: z.string().trim().max(80).optional(),
  email: z.string().trim().max(160).optional(),
  invited_by: z.string().trim().max(80).optional(),
  dietary_restrictions: z.string().trim().max(300).optional(),
  companions: z.array(companionSchema),
});

export type GuestFormValues = z.infer<typeof guestSchema>;
