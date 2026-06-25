import { z } from "zod";

const statLabelSchema = z
  .string("Stat label is required")
  .trim()
  .min(1, "Stat label is required")
  .max(120, "Stat label must be at most 120 characters long");

const statValueSchema = z
  .string("Stat value is required")
  .trim()
  .min(1, "Stat value is required")
  .max(120, "Stat value must be at most 120 characters long");

const statCategorySchema = z
  .string("Stat category must be a string")
  .trim()
  .min(1, "Stat category cannot be empty")
  .max(60, "Stat category must be at most 60 characters long");

export const createStatSchema = z.object({
  label: statLabelSchema,
  value: statValueSchema,
  category: statCategorySchema.optional(),
  order: z
    .number("Stat order must be a number")
    .int("Stat order must be an integer")
    .min(1, "Stat order must be at least 1")
    .optional(),
});

export const updateStatSchema = z
  .object({
    label: statLabelSchema.optional(),
    value: statValueSchema.optional(),
    category: statCategorySchema.optional(),
    order: z
      .number("Stat order must be a number")
      .int("Stat order must be an integer")
      .min(1, "Stat order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const statIdParamSchema = z.object({
  statId: z.string().uuid("Invalid statId format"),
});

export const listStatQuerySchema = z.object({
  category: statCategorySchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
