import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateSocialLinkInput = {
  platform: string;
  logoUrl: string;
  url: string;
  order?: number;
};

type UpdateSocialLinkInput = {
  platform?: string;
  logoUrl?: string;
  url?: string;
  order?: number;
};

type ListSocialLinkFilters = {
  platform?: string;
  search?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizePlatform = (value: string) => value.trim().toLowerCase();
const normalizeOptional = (value?: string) => value?.trim() || undefined;

const ensureSocialLinkExists = async (socialLinkId: string) => {
  const socialLink = await prisma.socialLink.findUnique({ where: { id: socialLinkId } });

  if (!socialLink) {
    throw httpError(404, "Social link not found");
  }

  return socialLink;
};

export const createSocialLink = async (
  input: CreateSocialLinkInput,
  userId?: string
) => {
  const count = await prisma.socialLink.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.socialLink.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.socialLink.create({
      data: {
        platform: normalizePlatform(input.platform),
        logoUrl: input.logoUrl.trim(),
        url: input.url.trim(),
        order: desiredOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.CREATE,
    entity: "SocialLink",
    entityId: created.id,
    newData: {
      id: created.id,
      platform: created.platform,
      url: created.url,
      order: created.order,
    },
  });

  return created;
};

export const getAllSocialLinks = async (filters: ListSocialLinkFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    platform: filters.platform ? normalizePlatform(filters.platform) : undefined,
    OR: filters.search
      ? [
          {
            platform: {
              contains: filters.search.toLowerCase(),
              mode: "insensitive" as const,
            },
          },
          {
            url: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ]
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.socialLink.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.socialLink.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.socialLink.count({ where }),
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

export const updateSocialLink = async (
  socialLinkId: string,
  input: UpdateSocialLinkInput,
  userId?: string
) => {
  const existing = await ensureSocialLinkExists(socialLinkId);
  const total = await prisma.socialLink.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.socialLink.updateMany({
        where: {
          id: { not: socialLinkId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.socialLink.updateMany({
        where: {
          id: { not: socialLinkId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.socialLink.update({
      where: { id: socialLinkId },
      data: {
        platform: input.platform !== undefined ? normalizePlatform(input.platform) : undefined,
        logoUrl: normalizeOptional(input.logoUrl),
        url: normalizeOptional(input.url),
        order: targetOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.UPDATE,
    entity: "SocialLink",
    entityId: updated.id,
    oldData: {
      id: existing.id,
      platform: existing.platform,
      url: existing.url,
      order: existing.order,
    },
    newData: {
      id: updated.id,
      platform: updated.platform,
      url: updated.url,
      order: updated.order,
    },
  });

  return updated;
};

export const deleteSocialLink = async (socialLinkId: string, userId?: string) => {
  const existing = await ensureSocialLinkExists(socialLinkId);

  await prisma.$transaction(async (tx) => {
    await tx.socialLink.delete({ where: { id: socialLinkId } });

    await tx.socialLink.updateMany({
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
    entity: "SocialLink",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      platform: existing.platform,
      url: existing.url,
      order: existing.order,
    },
  });

  return { success: true };
};
