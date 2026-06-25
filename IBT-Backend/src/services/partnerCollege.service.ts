import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreatePartnerCollegeInput = {
  name: string;
  logoUrl: string;
  website?: string;
  order?: number;
};

type UpdatePartnerCollegeInput = {
  name?: string;
  logoUrl?: string;
  website?: string | null;
  order?: number;
};

type ListPartnerCollegeFilters = {
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

const ensurePartnerCollegeExists = async (partnerCollegeId: string) => {
  const college = await prisma.partnerCollege.findUnique({ where: { id: partnerCollegeId } });

  if (!college) {
    throw httpError(404, "Partner College not found");
  }

  return college;
};

export const createPartnerCollege = async (
  input: CreatePartnerCollegeInput,
  userId?: string
) => {
  const count = await prisma.partnerCollege.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.partnerCollege.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.partnerCollege.create({
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
    entity: "PartnerCollege",
    entityId: created.id,
    newData: {
      id: created.id,
      name: created.name,
      order: created.order,
    },
  });

  return created;
};

export const getAllPartnerColleges = async (filters: ListPartnerCollegeFilters) => {
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
    return prisma.partnerCollege.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.partnerCollege.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.partnerCollege.count({ where }),
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

export const updatePartnerCollege = async (
  partnerCollegeId: string,
  input: UpdatePartnerCollegeInput,
  userId?: string
) => {
  const existing = await ensurePartnerCollegeExists(partnerCollegeId);
  const total = await prisma.partnerCollege.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.partnerCollege.updateMany({
        where: {
          id: { not: partnerCollegeId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.partnerCollege.updateMany({
        where: {
          id: { not: partnerCollegeId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.partnerCollege.update({
      where: { id: partnerCollegeId },
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
    entity: "PartnerCollege",
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

export const deletePartnerCollege = async (partnerCollegeId: string, userId?: string) => {
  const existing = await ensurePartnerCollegeExists(partnerCollegeId);

  await prisma.$transaction(async (tx) => {
    await tx.partnerCollege.delete({ where: { id: partnerCollegeId } });

    await tx.partnerCollege.updateMany({
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
    entity: "PartnerCollege",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      order: existing.order,
    },
  });

  return { success: true };
};
