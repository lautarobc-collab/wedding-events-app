import { z } from "zod";

export const giftSchema = z.object({
  gift_description: z.string().trim().max(200).optional(),
});

export type GiftFormValues = z.infer<typeof giftSchema>;
