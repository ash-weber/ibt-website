import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateClientInput = {
  name: string;
  logoUrl: string;
  website?: string | null;
  order?: number;
};

type UpdateClientInput = {
  name?: string;
  logoUrl?: string;
  website?: string | null;
  order?: number;
};

type ListClientFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const ensureClientExists = async (clientId: string) => {
  const client = await prisma.client.findUnique({ where: { id: clientId } });

  if (!client) {
    throw httpError(404, "Client not found");
  }

  return client;
};

export const createClient = async (input: CreateClientInput, userId?: string) => {
  const count = await prisma.client.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.client.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.client.create({
      data: {
        name: input.name,
        logoUrl: input.logoUrl,
        website: input.website ?? null,
        order: desiredOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.CREATE,
    entity: "Client",
    entityId: created.id,
    newData: {
      id: created.id,
      name: created.name,
      order: created.order,
    },
  });

  return created;
};

export const getAllClients = async (filters: ListClientFilters) => {
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
    return prisma.client.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.client.count({ where }),
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

export const updateClient = async (
  clientId: string,
  input: UpdateClientInput,
  userId?: string
) => {
  const existing = await ensureClientExists(clientId);
  const total = await prisma.client.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.client.updateMany({
        where: {
          id: { not: clientId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.client.updateMany({
        where: {
          id: { not: clientId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.client.update({
      where: { id: clientId },
      data: {
        name: input.name,
        logoUrl: input.logoUrl,
        website: input.website,
        order: targetOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.UPDATE,
    entity: "Client",
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

export const deleteClient = async (clientId: string, userId?: string) => {
  const existing = await ensureClientExists(clientId);

  await prisma.$transaction(async (tx) => {
    await tx.client.delete({ where: { id: clientId } });

    await tx.client.updateMany({
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
    entity: "Client",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      order: existing.order,
    },
  });

  return { success: true };
};
