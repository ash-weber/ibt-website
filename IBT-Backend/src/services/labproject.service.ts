import { AuditAction, LabStatus } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateLabProjectInput = {
  title: string;
  slug: string;
  description: string;
  content?: string;
  imageUrl?: string;
  gallery?: string[];
  tags?: string[];
  techStack?: string[];
  projectUrl?: string;
  repoUrl?: string;
  status?: LabStatus;
  featured?: boolean;
  order?: number;
};

type UpdateLabProjectInput = Partial<CreateLabProjectInput>;
type UpdateNullableLabProjectInput = Omit<UpdateLabProjectInput, "content" | "imageUrl" | "projectUrl" | "repoUrl"> & {
  content?: string | null;
  imageUrl?: string | null;
  projectUrl?: string | null;
  repoUrl?: string | null;
};

type ListLabProjectFilters = {
  search?: string;
  status?: LabStatus;
  featured?: boolean;
  tag?: string;
  tech?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeList = (values?: string[]) => {
  if (!values) return [];
  const unique = new Set(
    values
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => item.toLowerCase())
  );

  return [...unique];
};

const normalizeOptional = (value?: string) => value?.trim() || undefined;
const normalizeNullableOptional = (value: string | null) => {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const mapKnownPrismaError = (error: unknown): Error => {
  const err = error as { code?: string };

  if (err?.code === "P2002") {
    return httpError(409, "A lab project with these unique values already exists");
  }

  return error instanceof Error ? error : new Error("Unexpected database error");
};

const ensureLabProjectExists = async (labProjectId: string) => {
  const project = await prisma.labProject.findUnique({ where: { id: labProjectId } });
  if (!project) {
    throw httpError(404, "Lab project not found");
  }

  return project;
};

export const createLabProject = async (
  input: CreateLabProjectInput,
  userId?: string
) => {
  const totalOrdered = await prisma.labProject.count({
    where: { order: { not: null } },
  });
  const desiredOrder = clamp(input.order ?? totalOrdered + 1, 1, totalOrdered + 1);

  try {
    const created = await prisma.$transaction(async (tx) => {
      await tx.labProject.updateMany({
        where: {
          order: {
            not: null,
            gte: desiredOrder,
          },
        },
        data: { order: { increment: 1 } },
      });

      return tx.labProject.create({
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          content: normalizeOptional(input.content),
          imageUrl: normalizeOptional(input.imageUrl),
          gallery: normalizeList(input.gallery),
          tags: normalizeList(input.tags),
          techStack: normalizeList(input.techStack),
          projectUrl: normalizeOptional(input.projectUrl),
          repoUrl: normalizeOptional(input.repoUrl),
          status: input.status,
          featured: input.featured ?? false,
          order: desiredOrder,
        },
      });
    });

    await logAction({
      userId,
      action: AuditAction.CREATE,
      entity: "LabProject",
      entityId: created.id,
      newData: {
        id: created.id,
        slug: created.slug,
        title: created.title,
        status: created.status,
        featured: created.featured,
        order: created.order,
      },
    });

    return created;
  } catch (error) {
    throw mapKnownPrismaError(error);
  }
};

export const getAllLabProjects = async (filters: ListLabProjectFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    status: filters.status,
    featured: filters.featured,
    tags: filters.tag
      ? {
          has: filters.tag.toLowerCase(),
        }
      : undefined,
    techStack: filters.tech
      ? {
          has: filters.tech.toLowerCase(),
        }
      : undefined,
    OR: filters.search
      ? [
          { title: { contains: filters.search, mode: "insensitive" as const } },
          { description: { contains: filters.search, mode: "insensitive" as const } },
          { content: { contains: filters.search, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.labProject.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.labProject.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.labProject.count({ where }),
  ]);

  const page = filters.page!;
  const limit = filters.limit!;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getLabProjectBySlug = async (slug: string) => {
  const project = await prisma.labProject.findUnique({ where: { slug } });

  if (!project) {
    throw httpError(404, "Lab project not found");
  }

  return project;
};

export const updateLabProject = async (
  labProjectId: string,
  input: UpdateNullableLabProjectInput,
  userId?: string
) => {
  const existing = await ensureLabProjectExists(labProjectId);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      let targetOrder = existing.order;

      if (input.order !== undefined) {
        const totalOrdered = await tx.labProject.count({
          where: {
            order: { not: null },
            id: { not: labProjectId },
          },
        });

        const desiredOrder = clamp(input.order, 1, totalOrdered + 1);

        if (existing.order === null) {
          await tx.labProject.updateMany({
            where: {
              order: {
                not: null,
                gte: desiredOrder,
              },
            },
            data: {
              order: { increment: 1 },
            },
          });

          targetOrder = desiredOrder;
        } else {
          if (desiredOrder < existing.order) {
            await tx.labProject.updateMany({
              where: {
                id: { not: labProjectId },
                order: {
                  not: null,
                  gte: desiredOrder,
                  lt: existing.order,
                },
              },
              data: { order: { increment: 1 } },
            });
          }

          if (desiredOrder > existing.order) {
            await tx.labProject.updateMany({
              where: {
                id: { not: labProjectId },
                order: {
                  not: null,
                  gt: existing.order,
                  lte: desiredOrder,
                },
              },
              data: { order: { decrement: 1 } },
            });
          }

          targetOrder = desiredOrder;
        }
      }

      return tx.labProject.update({
        where: { id: labProjectId },
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          content: input.content !== undefined ? normalizeNullableOptional(input.content) : undefined,
          imageUrl: input.imageUrl !== undefined ? normalizeNullableOptional(input.imageUrl) : undefined,
          gallery: input.gallery ? normalizeList(input.gallery) : undefined,
          tags: input.tags ? normalizeList(input.tags) : undefined,
          techStack: input.techStack ? normalizeList(input.techStack) : undefined,
          projectUrl:
            input.projectUrl !== undefined ? normalizeNullableOptional(input.projectUrl) : undefined,
          repoUrl: input.repoUrl !== undefined ? normalizeNullableOptional(input.repoUrl) : undefined,
          status: input.status,
          featured: input.featured,
          order: targetOrder,
        },
      });
    });

    await logAction({
      userId,
      action: AuditAction.UPDATE,
      entity: "LabProject",
      entityId: updated.id,
      oldData: {
        id: existing.id,
        slug: existing.slug,
        title: existing.title,
        status: existing.status,
        order: existing.order,
      },
      newData: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        status: updated.status,
        order: updated.order,
      },
    });

    return updated;
  } catch (error) {
    throw mapKnownPrismaError(error);
  }
};

export const deleteLabProject = async (labProjectId: string, userId?: string) => {
  const existing = await ensureLabProjectExists(labProjectId);

  await prisma.$transaction(async (tx) => {
    await tx.labProject.delete({ where: { id: labProjectId } });

    if (existing.order !== null) {
      await tx.labProject.updateMany({
        where: {
          order: {
            not: null,
            gt: existing.order,
          },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }
  });

  await logAction({
    userId,
    action: AuditAction.DELETE,
    entity: "LabProject",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      slug: existing.slug,
      title: existing.title,
      status: existing.status,
      order: existing.order,
    },
  });

  return { success: true };
};
