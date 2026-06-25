import { z } from "zod";

export const createLabIdeaSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email address"),
  category: z.string().min(1, "Category is required"),
  ideaTitle: z.string().min(1, "Idea title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  attachments: z.array(z.string()).max(5, "Maximum 5 attachments allowed").optional(),
  privacyAccepted: z.boolean().or(z.string().transform(val => val === "true")).refine(val => val === true, "Privacy acceptance is required"),
});

export const updateLabIdeaStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
});

export const labIdeaIdParamSchema = z.object({
  labIdeaId: z.string().uuid("Invalid labIdeaId format"),
});

export const listLabIdeasQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.string().trim().max(50).optional(),
    category: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((data) => (data.page === undefined) === (data.limit === undefined), {
    message: "Both page and limit are required for pagination",
  });
