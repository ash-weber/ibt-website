import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: 
    z.string("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long"),
});