import { z } from "zod";

export const upsertTermsSchema = z.object({
  content: z
    .string("Terms content is required")
    .trim()
    .min(1, "Terms content is required")
    .max(200000, "Terms content must be at most 200000 characters long"),
});
