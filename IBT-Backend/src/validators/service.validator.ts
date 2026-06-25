import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const serviceSlugSchema = z
  .string("Service slug is required")
  .min(2, "Service slug must be at least 2 characters long")
  .max(120, "Service slug must be at most 120 characters long")
  .regex(
    slugRegex,
    "Service slug must use lowercase letters, numbers, and hyphens only"
  );

const serviceTitleSchema = z
  .string("Service title is required")
  .trim()
  .min(1, "Service title is required")
  .max(150, "Service title must be at most 150 characters long");

const serviceImageUrlSchema = z
  .string("Service imageUrl is required")
  .trim()
  .min(1, "Service imageUrl is required")
  .max(500, "Service imageUrl must be at most 500 characters long");

export const createServiceSchema = z.object({
  title: serviceTitleSchema,
  slug: serviceSlugSchema,
  description: z
    .string("Service description is required")
    .trim()
    .min(1, "Service description is required")
    .max(4000, "Service description must be at most 4000 characters long"),
  imageUrl: serviceImageUrlSchema,
  tags: z
    .array(
      z
        .string("Service tag must be a string")
        .trim()
        .min(1, "Service tag cannot be empty")
        .max(40, "Service tag must be at most 40 characters long")
    )
    .max(20, "Service can have at most 20 tags")
    .optional(),
  projectUrl: z
    .string()
    .url("Project URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  order: z
    .number("Service order must be a number")
    .int("Service order must be an integer")
    .min(1, "Service order must be at least 1")
    .optional(),
});

export const updateServiceSchema = z
  .object({
    title: serviceTitleSchema.optional(),
    slug: serviceSlugSchema.optional(),
    description: z
      .string("Service description must be a string")
      .trim()
      .min(1, "Service description cannot be empty")
      .max(4000, "Service description must be at most 4000 characters long")
      .optional(),
    imageUrl: serviceImageUrlSchema.optional(),
    tags: z
      .array(
        z
          .string("Service tag must be a string")
          .trim()
          .min(1, "Service tag cannot be empty")
          .max(40, "Service tag must be at most 40 characters long")
      )
      .max(20, "Service can have at most 20 tags")
      .optional(),
    projectUrl: z
      .string()
      .url("Project URL must be a valid URL")
      .optional()
      .or(z.literal("")),
    order: z
      .number("Service order must be a number")
      .int("Service order must be an integer")
      .min(1, "Service order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const serviceIdParamSchema = z.object({
  serviceId: z.string().uuid("Invalid serviceId format"),
});

export const serviceSlugParamSchema = z.object({
  slug: serviceSlugSchema,
});

export const listServiceQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  tag: z.string().trim().min(1).max(40).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});