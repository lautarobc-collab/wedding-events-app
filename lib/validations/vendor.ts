import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre").max(120),
  contact_phone: z.string().trim().max(40).optional(),
  contact_email: z.string().trim().max(160).optional(),
  website: z.string().trim().max(200).optional(),
  price: z
    .number({ error: "Tiene que ser un número" })
    .nonnegative("No puede ser negativo")
    .optional(),
  status: z.enum(["candidato", "contactado", "elegido", "descartado"]),
  notes: z.string().trim().max(500).optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
