import { z } from "zod";

const clientNameSchema = z
  .string("Client name is required")
  .trim()
  .min(1, "Client name is required")
  .max(150, "Client name must be at most 150 characters long");

const clientLogoUrlSchema = z
  .string("Client logo URL is required")
  .trim()
  .min(1, "Client logo URL is required")
  .max(500, "Client logo URL must be at most 500 characters long");

const clientWebsiteSchema = z
  .string()
  .trim()
  .url("Invalid website URL format")
  .or(z.literal(""))
  .optional()
  .nullable();

export const createClientSchema = z.object({
  name: clientNameSchema,
  logoUrl: clientLogoUrlSchema,
  website: clientWebsiteSchema,
  order: z
    .number("Client order must be a number")
    .int("Client order must be an integer")
    .min(1, "Client order must be at least 1")
    .optional(),
});

export const updateClientSchema = z
  .object({
    name: clientNameSchema.optional(),
    logoUrl: clientLogoUrlSchema.optional(),
    website: clientWebsiteSchema,
    order: z
      .number("Client order must be a number")
      .int("Client order must be an integer")
      .min(1, "Client order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const clientIdParamSchema = z.object({
  clientId: z.string().uuid("Invalid clientId format"),
});

export const listClientQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
