import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreatePartnerInput = {
  name: string;
  logoUrl: string;
  website?: string;
  order?: number;
};

type UpdatePartnerInput = {
  name?: string;
  logoUrl?: string;
  website?: string | null;
  order?: number;
};

type ListPartnerFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeWebsite = (website?: string) => website?.trim() || undefined;
const normalizeNullableWebsite = (website: string | null) => {
  if (website === null) return null;
  const normalized = website.trim();
  return normalized.length > 0 ? normalized : null;
};

const ensurePartnerExists = async (partnerId: string) => {
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });

  if (!partner) {
    throw httpError(404, "Partner not found");
  }

  return partner;
};

export const createPartner = async (
  input: CreatePartnerInput,
  userId?: string
) => {
  const count = await prisma.partner.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.partner.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.partner.create({
      data: {
        name: input.name,
        logoUrl: input.logoUrl,
        website: normalizeWebsite(input.website),
        order: desiredOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.CREATE,
    entity: "Partner",
    entityId: created.id,
    newData: {
      id: created.id,
      name: created.name,
      order: created.order,
    },
  });

  return created;
};

export const getAllPartners = async (filters: ListPartnerFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    name: filters.search
      ? {
          contains: filters.search,
          mode: "insensitive" as const,
        }
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.partner.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.partner.count({ where }),
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

export const updatePartner = async (
  partnerId: string,
  input: UpdatePartnerInput,
  userId?: string
) => {
  const existing = await ensurePartnerExists(partnerId);
  const total = await prisma.partner.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.partner.updateMany({
        where: {
          id: { not: partnerId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.partner.updateMany({
        where: {
          id: { not: partnerId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.partner.update({
      where: { id: partnerId },
      data: {
        name: input.name,
        logoUrl: input.logoUrl,
        website: input.website !== undefined ? normalizeNullableWebsite(input.website) : undefined,
        order: targetOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.UPDATE,
    entity: "Partner",
    entityId: updated.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      order: existing.order,
    },
    newData: {
      id: updated.id,
      name: updated.name,
      order: updated.order,
    },
  });

  return updated;
};

export const deletePartner = async (partnerId: string, userId?: string) => {
  const existing = await ensurePartnerExists(partnerId);

  await prisma.$transaction(async (tx) => {
    await tx.partner.delete({ where: { id: partnerId } });

    await tx.partner.updateMany({
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
    entity: "Partner",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      order: existing.order,
    },
  });

  return { success: true };
};
