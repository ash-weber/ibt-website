import { LabStatus } from "../../generated/prisma/client";
import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const parseBoolean = (value: unknown) => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return value;
};

export const publicPaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((data) => (data.page === undefined) === (data.limit === undefined), {
    message: "Both page and limit are required for pagination",
  });

export const publicSlugParamSchema = z.object({
  slug: z
    .string("Slug is required")
    .trim()
    .min(2, "Slug must be at least 2 characters long")
    .max(160, "Slug must be at most 160 characters long")
    .regex(slugRegex, "Slug must use lowercase letters, numbers, and hyphens only"),
});

export const publicBranchIdParamSchema = z.object({
  branchId: z.string().uuid("Invalid branchId format"),
});

export const publicBlogListQuerySchema = publicPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(150).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  featured: z.preprocess(parseBoolean, z.boolean().optional()),
});

export const publicProjectListQuerySchema = publicPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(150).optional(),
  tag: z.string().trim().min(1).max(40).optional(),
  tech: z.string().trim().min(1).max(60).optional(),
  featured: z.preprocess(parseBoolean, z.boolean().optional()),
  status: z.enum([LabStatus.ONGOING, LabStatus.COMPLETED]).optional(),
});

export const publicServiceListQuerySchema = publicPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
  tag: z.string().trim().min(1).max(40).optional(),
});

export const publicTeamListQuerySchema = publicPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
  branchId: z.string().uuid("Invalid branchId format").optional(),
});

export const publicBranchListQuerySchema = publicPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
});

export const publicBranchMembersQuerySchema = publicPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
});

export const publicStatsListQuerySchema = publicPaginationQuerySchema.extend({
  category: z.string().trim().min(1).max(80).optional(),
});

export const publicContactsListQuerySchema = publicPaginationQuerySchema.extend({
  type: z.enum(["PHONE", "EMAIL", "ADDRESS"]).optional(),
});

export const publicTermsListQuerySchema = publicPaginationQuerySchema;

export const publicSettingsListQuerySchema = publicPaginationQuerySchema;
