import { z } from "zod";

const memberNameSchema = z
  .string("Member name is required")
  .trim()
  .min(1, "Member name is required")
  .max(120, "Member name must be at most 120 characters long");

const memberRoleSchema = z
  .string("Member role is required")
  .trim()
  .min(1, "Member role is required")
  .max(120, "Member role must be at most 120 characters long");

const avatarUrlSchema = z
  .string("Member avatar URL is required")
  .trim()
  .min(1, "Member avatar URL is required")
  .max(500, "Member avatar URL must be at most 500 characters long");

const phoneSchema = z
  .string("Phone is required")
  .trim()
  .min(5, "Phone must be at least 5 characters long")
  .max(30, "Phone must be at most 30 characters long");

const orderSchema = z
  .number()
  .int("Order must be an integer")
  .min(0, "Order must be at least 0")
  .optional();

export const createMemberSchema = z.object({
  name: memberNameSchema,
  role: memberRoleSchema,
  avatarUrl: avatarUrlSchema,
  email: z.string("Email is required").trim().email("Email must be valid"),
  linkedinUrl: z.string().trim().url("LinkedIn URL must be valid").optional().or(z.literal("")),
  phone: phoneSchema,
  order: orderSchema,
});

export const updateMemberSchema = z
  .object({
    name: memberNameSchema.optional(),
    role: memberRoleSchema.optional(),
    avatarUrl: avatarUrlSchema.optional(),
    email: z.string().trim().email("Email must be valid").optional(),
    linkedinUrl: z.string().trim().url("LinkedIn URL must be valid").optional().or(z.literal("")),
    phone: phoneSchema.optional(),
    order: orderSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const memberIdParamSchema = z.object({
  memberId: z.string().uuid("Invalid memberId format"),
});

export const listMemberQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  branchId: z.string().uuid("Invalid branchId format").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
