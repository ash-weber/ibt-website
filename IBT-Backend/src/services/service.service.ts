import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateServiceInput = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  tags?: string[];
  order?: number;
};

type UpdateServiceInput = {
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  projectUrl?: string;
  tags?: string[];
  order?: number;
};

type ListServiceFilters = {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const mapKnownPrismaError = (error: unknown): Error => {
  const err = error as { code?: string };

  if (err?.code === "P2002") {
    return httpError(409, "A service with these unique values already exists");
  }

  return error instanceof Error ? error : new Error("Unexpected database error");
};

const ensureServiceExists = async (serviceId: string) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw httpError(404, "Service not found");
  }

  return service;
};

const normalizeTags = (tags?: string[]) => {
  if (!tags) return [];

  const unique = new Set(
    tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.toLowerCase())
  );

  return [...unique];
};

export const createService = async (input: CreateServiceInput, userId?: string) => {
  const count = await prisma.service.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  try {
    const created = await prisma.$transaction(async (tx) => {
      await tx.service.updateMany({
        where: {
          order: { gte: desiredOrder },
        },
        data: {
          order: { increment: 1 },
        },
      });

      return tx.service.create({
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          imageUrl: input.imageUrl,
          projectUrl: input.projectUrl,
          tags: normalizeTags(input.tags),
          order: desiredOrder,
        },
      });
    });

    await logAction({
      userId,
      action: AuditAction.CREATE,
      entity: "Service",
      entityId: created.id,
      newData: {
        id: created.id,
        slug: created.slug,
        title: created.title,
        order: created.order,
      },
    });

    return created;
  } catch (error) {
    throw mapKnownPrismaError(error);
  }
};

export const getAllServices = async (filters: ListServiceFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    title: filters.search
      ? {
          contains: filters.search,
          mode: "insensitive" as const,
        }
      : undefined,
    tags: filters.tag
      ? {
          has: filters.tag.toLowerCase(),
        }
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.service.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.service.count({ where }),
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

export const getServiceBySlug = async (slug: string) => {
  const service = await prisma.service.findUnique({ where: { slug } });

  if (!service) {
    throw httpError(404, "Service not found");
  }

  return service;
};

export const updateService = async (
  serviceId: string,
  input: UpdateServiceInput,
  userId?: string
) => {
  const existing = await ensureServiceExists(serviceId);
  const totalServices = await prisma.service.count();
  const targetOrder =
    input.order !== undefined
      ? clamp(input.order, 1, totalServices)
      : existing.order;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (targetOrder < existing.order) {
        await tx.service.updateMany({
          where: {
            id: { not: serviceId },
            order: {
              gte: targetOrder,
              lt: existing.order,
            },
          },
          data: { order: { increment: 1 } },
        });
      }

      if (targetOrder > existing.order) {
        await tx.service.updateMany({
          where: {
            id: { not: serviceId },
            order: {
              gt: existing.order,
              lte: targetOrder,
            },
          },
          data: { order: { decrement: 1 } },
        });
      }

      return tx.service.update({
        where: { id: serviceId },
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          imageUrl: input.imageUrl,
          projectUrl: input.projectUrl,
          tags: input.tags ? normalizeTags(input.tags) : undefined,
          order: targetOrder,
        },
      });
    });

    await logAction({
      userId,
      action: AuditAction.UPDATE,
      entity: "Service",
      entityId: updated.id,
      oldData: {
        id: existing.id,
        slug: existing.slug,
        title: existing.title,
        order: existing.order,
      },
      newData: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        order: updated.order,
      },
    });

    return updated;
  } catch (error) {
    throw mapKnownPrismaError(error);
  }
};

export const deleteService = async (serviceId: string, userId?: string) => {
  const existing = await ensureServiceExists(serviceId);

  await prisma.$transaction(async (tx) => {
    await tx.service.delete({ where: { id: serviceId } });

    await tx.service.updateMany({
      where: {
        order: { gt: existing.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.DELETE,
    entity: "Service",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      slug: existing.slug,
      title: existing.title,
      order: existing.order,
    },
  });

  return { success: true };
};