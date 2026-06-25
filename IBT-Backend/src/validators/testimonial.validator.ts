import { z } from "zod";

const testimonialNameSchema = z
  .string("Testimonial name is required")
  .trim()
  .min(1, "Testimonial name is required")
  .max(120, "Testimonial name must be at most 120 characters long");

const testimonialContentSchema = z
  .string("Testimonial content is required")
  .trim()
  .min(1, "Testimonial content is required")
  .max(3000, "Testimonial content must be at most 3000 characters long");

const roleSchema = z
  .string("Role must be a string")
  .trim()
  .min(1, "Role cannot be empty")
  .max(120, "Role must be at most 120 characters long");

const companySchema = z
  .string("Company must be a string")
  .trim()
  .min(1, "Company cannot be empty")
  .max(120, "Company must be at most 120 characters long");

const avatarUrlSchema = z
  .string("Avatar URL must be a string")
  .trim()
  .min(1, "Avatar URL cannot be empty")
  .max(500, "Avatar URL must be at most 500 characters long");

export const createTestimonialSchema = z.object({
  name: testimonialNameSchema,
  content: testimonialContentSchema,
  role: roleSchema.optional(),
  company: companySchema.optional(),
  avatarUrl: avatarUrlSchema.optional(),
  order: z
    .number("Testimonial order must be a number")
    .int("Testimonial order must be an integer")
    .min(1, "Testimonial order must be at least 1")
    .optional(),
});

export const updateTestimonialSchema = z
  .object({
    name: testimonialNameSchema.optional(),
    content: testimonialContentSchema.optional(),
    role: z.union([roleSchema, z.null()]).optional(),
    company: z.union([companySchema, z.null()]).optional(),
    avatarUrl: z.union([avatarUrlSchema, z.null()]).optional(),
    order: z
      .number("Testimonial order must be a number")
      .int("Testimonial order must be an integer")
      .min(1, "Testimonial order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const testimonialIdParamSchema = z.object({
  testimonialId: z.string().uuid("Invalid testimonialId format"),
});

export const listTestimonialQuerySchema = z.object({
  company: companySchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
