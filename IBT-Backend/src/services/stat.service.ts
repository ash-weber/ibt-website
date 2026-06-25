import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateStatInput = {
  label: string;
  value: string;
  category?: string;
  order?: number;
};

type UpdateStatInput = {
  label?: string;
  value?: string;
  category?: string;
  order?: number;
};

type ListStatFilters = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const ensureStatExists = async (statId: string) => {
  const stat = await prisma.stat.findUnique({ where: { id: statId } });

  if (!stat) {
    throw httpError(404, "Stat not found");
  }

  return stat;
};

const normalizeCategory = (category?: string) =>
  category?.trim().toLowerCase() || undefined;

export const createStat = async (input: CreateStatInput, userId?: string) => {
  const count = await prisma.stat.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.stat.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.stat.create({
      data: {
        label: input.label,
        value: input.value,
        category: normalizeCategory(input.category),
        order: desiredOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.CREATE,
    entity: "Stat",
    entityId: created.id,
    newData: {
      id: created.id,
      label: created.label,
      value: created.value,
      category: created.category,
      order: created.order,
    },
  });

  return created;
};

export const getAllStats = async (filters: ListStatFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    category: filters.category ? normalizeCategory(filters.category) : undefined,
    label: filters.search
      ? {
          contains: filters.search,
          mode: "insensitive" as const,
        }
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.stat.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.stat.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.stat.count({ where }),
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

export const updateStat = async (
  statId: string,
  input: UpdateStatInput,
  userId?: string
) => {
  const existing = await ensureStatExists(statId);
  const total = await prisma.stat.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.stat.updateMany({
        where: {
          id: { not: statId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.stat.updateMany({
        where: {
          id: { not: statId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.stat.update({
      where: { id: statId },
      data: {
        label: input.label,
        value: input.value,
        category: input.category !== undefined ? normalizeCategory(input.category) : undefined,
        order: targetOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.UPDATE,
    entity: "Stat",
    entityId: updated.id,
    oldData: {
      id: existing.id,
      label: existing.label,
      value: existing.value,
      category: existing.category,
      order: existing.order,
    },
    newData: {
      id: updated.id,
      label: updated.label,
      value: updated.value,
      category: updated.category,
      order: updated.order,
    },
  });

  return updated;
};

export const deleteStat = async (statId: string, userId?: string) => {
  const existing = await ensureStatExists(statId);

  await prisma.$transaction(async (tx) => {
    await tx.stat.delete({ where: { id: statId } });

    await tx.stat.updateMany({
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
    entity: "Stat",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      label: existing.label,
      value: existing.value,
      category: existing.category,
      order: existing.order,
    },
  });

  return { success: true };
};
