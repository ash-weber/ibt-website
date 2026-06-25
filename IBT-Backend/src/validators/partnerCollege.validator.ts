import { z } from "zod";

const collegeNameSchema = z
  .string("College name is required")
  .trim()
  .min(1, "College name is required")
  .max(150, "College name must be at most 150 characters long");

const collegeLogoUrlSchema = z
  .string("College logo URL is required")
  .trim()
  .min(1, "College logo URL is required")
  .max(500, "College logo URL must be at most 500 characters long");

const collegeWebsiteSchema = z
  .union([
    z.string().trim().url("College website must be a valid URL").max(500, "College website must be at most 500 characters long"),
    z.literal(""),
    z.null()
  ]);

export const createPartnerCollegeSchema = z.object({
  name: collegeNameSchema,
  logoUrl: collegeLogoUrlSchema,
  website: collegeWebsiteSchema.optional(),
  order: z
    .number("College order must be a number")
    .int("College order must be an integer")
    .min(1, "College order must be at least 1")
    .optional(),
});

export const updatePartnerCollegeSchema = z
  .object({
    name: collegeNameSchema.optional(),
    logoUrl: collegeLogoUrlSchema.optional(),
    website: collegeWebsiteSchema.optional(),
    order: z
      .number("College order must be a number")
      .int("College order must be an integer")
      .min(1, "College order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const partnerCollegeIdParamSchema = z.object({
  partnerCollegeId: z.string().min(1, "Invalid partnerCollegeId format"),
});

export const listPartnerCollegeQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
