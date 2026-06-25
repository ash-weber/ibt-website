import { z } from "zod";

const partnerNameSchema = z
  .string("Partner name is required")
  .trim()
  .min(1, "Partner name is required")
  .max(150, "Partner name must be at most 150 characters long");

const partnerLogoUrlSchema = z
  .string("Partner logo URL is required")
  .trim()
  .min(1, "Partner logo URL is required")
  .max(500, "Partner logo URL must be at most 500 characters long");

const partnerWebsiteSchema = z
  .string("Partner website must be a string")
  .trim()
  .url("Partner website must be a valid URL")
  .max(500, "Partner website must be at most 500 characters long");

export const createPartnerSchema = z.object({
  name: partnerNameSchema,
  logoUrl: partnerLogoUrlSchema,
  website: partnerWebsiteSchema.optional(),
  order: z
    .number("Partner order must be a number")
    .int("Partner order must be an integer")
    .min(1, "Partner order must be at least 1")
    .optional(),
});

export const updatePartnerSchema = z
  .object({
    name: partnerNameSchema.optional(),
    logoUrl: partnerLogoUrlSchema.optional(),
    website: z.union([partnerWebsiteSchema, z.null()]).optional(),
    order: z
      .number("Partner order must be a number")
      .int("Partner order must be an integer")
      .min(1, "Partner order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const partnerIdParamSchema = z.object({
  partnerId: z.string().uuid("Invalid partnerId format"),
});

export const listPartnerQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
