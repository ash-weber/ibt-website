import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";

type ListAuditLogFilters = {
  action?: AuditAction;
  entity?: string;
  entityId?: string;
  userId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
};

const normalizeOptional = (value?: string) => value?.trim() || undefined;

export const getAuditLogById = async (auditLogId: string) => {
  const auditLog = await prisma.auditLog.findUnique({
    where: { id: auditLogId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!auditLog) {
    throw httpError(404, "Audit log not found");
  }

  return auditLog;
};

export const getAllAuditLogs = async (filters: ListAuditLogFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const from = filters.from;
  const to = filters.to;

  const where = {
    action: filters.action,
    entity: filters.entity
      ? {
          contains: normalizeOptional(filters.entity),
          mode: "insensitive" as const,
        }
      : undefined,
    entityId: filters.entityId
      ? {
          contains: normalizeOptional(filters.entityId),
          mode: "insensitive" as const,
        }
      : undefined,
    userId: filters.userId,
    createdAt:
      from || to
        ? {
            gte: from,
            lte: to,
          }
        : undefined,
    OR: filters.search
      ? [
          {
            entity: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            entityId: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            user: {
              is: {
                OR: [
                  {
                    email: {
                      contains: filters.search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    name: {
                      contains: filters.search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          },
        ]
      : undefined,
  };

  const include = {
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    },
  };

  const orderBy = [{ createdAt: "desc" as const }];

  if (!shouldPaginate) {
    return prisma.auditLog.findMany({
      where,
      include,
      orderBy,
    });
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include,
      orderBy,
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
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
