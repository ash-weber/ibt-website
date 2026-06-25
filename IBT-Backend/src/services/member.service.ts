import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateMemberInput = {
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
  linkedinUrl?: string;
  phone: string;
};

type UpdateMemberInput = Partial<CreateMemberInput>;

// include order in inputs
type CreateMemberInputWithOrder = CreateMemberInput & { order?: number };
type UpdateMemberInputWithOrder = Partial<CreateMemberInputWithOrder>;

type ListMemberFilters = {
  search?: string;
  branchId?: string;
  page?: number;
  limit?: number;
};

const mapKnownPrismaError = (error: unknown): Error => {
  const err = error as { code?: string; meta?: { target?: string[] } };

  if (err?.code === "P2002") {
    const target = err.meta?.target?.join(", ") || "email or phone";
    return httpError(409, `Member already exists for unique field: ${target}`);
  }

  return error instanceof Error ? error : new Error("Unexpected database error");
};

const ensureMemberExists = async (memberId: string) => {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    throw httpError(404, "Member not found");
  }

  return member;
};

export const createMember = async (input: CreateMemberInputWithOrder, userId?: string) => {
  try {
    // determine next order if not provided
    let orderValue = input.order
    if (orderValue === undefined) {
      const maxRes = await prisma.member.aggregate({ _max: { order: true } })
      const maxOrder = maxRes._max.order ?? 0
      orderValue = maxOrder + 1
    }

    const created = await prisma.member.create({
      data: {
        name: input.name,
        role: input.role,
        avatarUrl: input.avatarUrl,
        email: input.email.toLowerCase(),
        linkedinUrl: input.linkedinUrl,
        phone: input.phone,
        order: orderValue,
      },
    });

    await logAction({
      userId,
      action: AuditAction.CREATE,
      entity: "Member",
      entityId: created.id,
      newData: {
        id: created.id,
        name: created.name,
        email: created.email,
      },
    });

    return created;
  } catch (error) {
    throw mapKnownPrismaError(error);
  }
};

export const getAllMembers = async (filters: ListMemberFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    OR: filters.search
      ? [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { role: { contains: filters.search, mode: "insensitive" as const } },
          { email: { contains: filters.search, mode: "insensitive" as const } },
        ]
      : undefined,
    branches: filters.branchId
      ? {
          some: {
            branchId: filters.branchId,
          },
        }
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.member.findMany({
      where,
      include: {
        branches: {
          include: {
            branch: true,
          },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        branches: {
          include: {
            branch: true,
          },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.member.count({ where }),
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

export const updateMember = async (
  memberId: string,
  input: UpdateMemberInputWithOrder,
  userId?: string
) => {
  const existing = await ensureMemberExists(memberId);

  try {
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: {
        name: input.name,
        role: input.role,
        avatarUrl: input.avatarUrl,
        email: input.email ? input.email.toLowerCase() : undefined,
        linkedinUrl: input.linkedinUrl,
        phone: input.phone,
        order: input.order,
      },
    });

    await logAction({
      userId,
      action: AuditAction.UPDATE,
      entity: "Member",
      entityId: updated.id,
      oldData: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
      },
      newData: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
    });

    return updated;
  } catch (error) {
    throw mapKnownPrismaError(error);
  }
};

export const deleteMember = async (memberId: string, userId?: string) => {
  const existing = await ensureMemberExists(memberId);

  await prisma.$transaction(async (tx) => {
    const assignments = await tx.branchMember.findMany({
      where: { memberId },
      orderBy: { order: "asc" },
    });

    await tx.member.delete({ where: { id: memberId } });

    // decrement branch member orders
    for (const assignment of assignments) {
      await tx.branchMember.updateMany({
        where: {
          branchId: assignment.branchId,
          order: { gt: assignment.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }

    // decrement global member orders greater than deleted
    await tx.member.updateMany({
      where: {
        order: { gt: existing.order ?? 0 },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.DELETE,
    entity: "Member",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      email: existing.email,
    },
  });

  return { success: true };
};
