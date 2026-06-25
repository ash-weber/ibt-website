import { BranchType } from "../../generated/prisma/client";
import { z } from "zod";

const branchNameSchema = z
  .string("Branch name is required")
  .trim()
  .min(1, "Branch name is required")
  .max(150, "Branch name must be at most 150 characters long");

const branchLocationSchema = z
  .string("Branch location is required")
  .trim()
  .min(1, "Branch location is required")
  .max(200, "Branch location must be at most 200 characters long");

export const createBranchSchema = z.object({
  name: branchNameSchema,
  location: branchLocationSchema,
  address: z.string().trim().min(1, "Address is required").max(500).optional(),
  mapUrl: z.string().url("Invalid map URL format").optional(),
  type: z.nativeEnum(BranchType, {
    error: "Branch type is invalid",
  }),
  order: z
    .number("Branch order must be a number")
    .int("Branch order must be an integer")
    .min(1, "Branch order must be at least 1")
    .optional(),
});

export const updateBranchSchema = z
  .object({
    name: branchNameSchema.optional(),
    location: branchLocationSchema.optional(),
    address: z.string().trim().min(1).max(500).optional(),
    mapUrl: z.string().url("Invalid map URL format").optional(),
    type: z.nativeEnum(BranchType).optional(),
    order: z
      .number("Branch order must be a number")
      .int("Branch order must be an integer")
      .min(1, "Branch order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const branchIdParamSchema = z.object({
  branchId: z.string().uuid("Invalid branchId format"),
});

export const listBranchQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  type: z.nativeEnum(BranchType).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});

export const listBranchMembersQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});

export const assignBranchMemberSchema = z.object({
  memberId: z.string().uuid("Invalid memberId format"),
  order: z
    .number("Assignment order must be a number")
    .int("Assignment order must be an integer")
    .min(1, "Assignment order must be at least 1")
    .optional(),
});

export const updateBranchMemberOrderSchema = z.object({
  order: z
    .number("Assignment order must be a number")
    .int("Assignment order must be an integer")
    .min(1, "Assignment order must be at least 1"),
});

export const branchMemberParamsSchema = z.object({
  branchId: z.string().uuid("Invalid branchId format"),
  memberId: z.string().uuid("Invalid memberId format"),
});
