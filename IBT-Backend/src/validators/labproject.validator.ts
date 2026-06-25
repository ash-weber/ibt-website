import { LabStatus } from "../../generated/prisma/client";
import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const labProjectSlugSchema = z
  .string("Lab project slug is required")
  .trim()
  .min(2, "Lab project slug must be at least 2 characters long")
  .max(120, "Lab project slug must be at most 120 characters long")
  .regex(
    slugRegex,
    "Lab project slug must use lowercase letters, numbers, and hyphens only"
  );

const titleSchema = z
  .string("Lab project title is required")
  .trim()
  .min(1, "Lab project title is required")
  .max(180, "Lab project title must be at most 180 characters long");

const descriptionSchema = z
  .string("Lab project description is required")
  .trim()
  .min(1, "Lab project description is required")
  .max(4000, "Lab project description must be at most 4000 characters long");

const contentSchema = z
  .string("Lab project content must be a string")
  .trim()
  .min(1, "Lab project content cannot be empty")
  .max(20000, "Lab project content must be at most 20000 characters long");

const tagSchema = z
  .string("Tag must be a string")
  .trim()
  .min(1, "Tag cannot be empty")
  .max(40, "Tag must be at most 40 characters long");

const techSchema = z
  .string("Tech stack item must be a string")
  .trim()
  .min(1, "Tech stack item cannot be empty")
  .max(60, "Tech stack item must be at most 60 characters long");

const mediaUrlSchema = z
  .string("URL must be a string")
  .trim()
  .min(1, "URL cannot be empty")
  .max(500, "URL must be at most 500 characters long");

export const createLabProjectSchema = z.object({
  title: titleSchema,
  slug: labProjectSlugSchema,
  description: descriptionSchema,
  content: contentSchema.optional(),
  imageUrl: mediaUrlSchema.optional(),
  gallery: z.array(mediaUrlSchema).max(20, "Gallery can have at most 20 items").optional(),
  tags: z.array(tagSchema).max(20, "Tags can have at most 20 items").optional(),
  techStack: z.array(techSchema).max(20, "Tech stack can have at most 20 items").optional(),
  projectUrl: z.string().url("Project URL must be valid").max(500).optional(),
  repoUrl: z.string().url("Repo URL must be valid").max(500).optional(),
  status: z.nativeEnum(LabStatus).optional(),
  featured: z.boolean("Featured must be a boolean").optional(),
  order: z
    .number("Order must be a number")
    .int("Order must be an integer")
    .min(1, "Order must be at least 1")
    .optional(),
});

export const updateLabProjectSchema = z
  .object({
    title: titleSchema.optional(),
    slug: labProjectSlugSchema.optional(),
    description: descriptionSchema.optional(),
    content: z
      .union([
        contentSchema,
        z.null(),
      ])
      .optional(),
    imageUrl: z.union([mediaUrlSchema, z.null()]).optional(),
    gallery: z.array(mediaUrlSchema).max(20, "Gallery can have at most 20 items").optional(),
    tags: z.array(tagSchema).max(20, "Tags can have at most 20 items").optional(),
    techStack: z.array(techSchema).max(20, "Tech stack can have at most 20 items").optional(),
    projectUrl: z.union([z.string().url("Project URL must be valid").max(500), z.null()]).optional(),
    repoUrl: z.union([z.string().url("Repo URL must be valid").max(500), z.null()]).optional(),
    status: z.nativeEnum(LabStatus).optional(),
    featured: z.boolean("Featured must be a boolean").optional(),
    order: z
      .number("Order must be a number")
      .int("Order must be an integer")
      .min(1, "Order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const labProjectIdParamSchema = z.object({
  labProjectId: z.string().uuid("Invalid labProjectId format"),
});

export const labProjectSlugParamSchema = z.object({
  slug: labProjectSlugSchema,
});

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

export const listLabProjectQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  status: z.nativeEnum(LabStatus).optional(),
  featured: z.preprocess(parseBoolean, z.boolean().optional()),
  tag: tagSchema.optional(),
  tech: techSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine((data) => (data.page === undefined) === (data.limit === undefined), {
  message: "Both page and limit are required for pagination",
});
