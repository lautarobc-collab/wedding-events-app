import { z } from "zod";

export const guestSchema = z
  .object({
    first_name: z.string().trim().min(1, "Ponle un nombre").max(80),
    last_name: z.string().trim().max(80).optional(),
    email: z.string().trim().max(160).optional(),
    invited_by: z.string().trim().max(80).optional(),
    plus_ones: z
      .number({ error: "Tiene que ser un número" })
      .int("Tiene que ser un número entero")
      .nonnegative("No puede ser negativo"),
    children_count: z
      .number({ error: "Tiene que ser un número" })
      .int("Tiene que ser un número entero")
      .nonnegative("No puede ser negativo"),
    dietary_restrictions: z.string().trim().max(300).optional(),
    table_number: z
      .number({ error: "Tiene que ser un número" })
      .int()
      .nonnegative()
      .optional(),
  })
  .refine((data) => data.children_count <= data.plus_ones, {
    message: "No puede haber más niños que acompañantes",
    path: ["children_count"],
  });

export type GuestFormValues = z.infer<typeof guestSchema>;
