import { z } from "zod";

const socialPlatformSchema = z
  .string("Platform is required")
  .trim()
  .min(1, "Platform is required")
  .max(50, "Platform must be at most 50 characters long");

const socialLogoUrlSchema = z
  .string("Logo URL is required")
  .trim()
  .min(1, "Logo URL is required")
  .max(500, "Logo URL must be at most 500 characters long");

const socialUrlSchema = z
  .string("URL is required")
  .trim()
  .url("URL must be valid")
  .max(500, "URL must be at most 500 characters long");

export const createSocialLinkSchema = z.object({
  platform: socialPlatformSchema,
  logoUrl: socialLogoUrlSchema,
  url: socialUrlSchema,
  order: z
    .number("Order must be a number")
    .int("Order must be an integer")
    .min(1, "Order must be at least 1")
    .optional(),
});

export const updateSocialLinkSchema = z
  .object({
    platform: socialPlatformSchema.optional(),
    logoUrl: socialLogoUrlSchema.optional(),
    url: socialUrlSchema.optional(),
    order: z
      .number("Order must be a number")
      .int("Order must be an integer")
      .min(1, "Order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const socialLinkIdParamSchema = z.object({
  socialLinkId: z.string().uuid("Invalid socialLinkId format"),
});

export const listSocialLinkQuerySchema = z
  .object({
    platform: socialPlatformSchema.optional(),
    search: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((data) => (data.page === undefined) === (data.limit === undefined), {
    message: "Both page and limit are required for pagination",
  });
