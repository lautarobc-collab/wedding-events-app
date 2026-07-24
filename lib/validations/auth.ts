import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type AuthFormValues = z.infer<typeof authSchema>;
