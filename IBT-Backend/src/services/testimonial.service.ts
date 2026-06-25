import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateTestimonialInput = {
  name: string;
  content: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  order?: number;
};

type UpdateTestimonialInput = {
  name?: string;
  content?: string;
  role?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  order?: number;
};

type ListTestimonialFilters = {
  company?: string;
  search?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeText = (value?: string) => value?.trim() || undefined;
const normalizeCompany = (value?: string) => value?.trim().toLowerCase() || undefined;
const normalizeNullableText = (value: string | null) => {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};
const normalizeNullableCompany = (value: string | null) => {
  if (value === null) return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const ensureTestimonialExists = async (testimonialId: string) => {
  const testimonial = await prisma.testimonial.findUnique({ where: { id: testimonialId } });

  if (!testimonial) {
    throw httpError(404, "Testimonial not found");
  }

  return testimonial;
};

export const createTestimonial = async (
  input: CreateTestimonialInput,
  userId?: string
) => {
  const count = await prisma.testimonial.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.testimonial.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.testimonial.create({
      data: {
        name: input.name,
        content: input.content,
        role: normalizeText(input.role),
        company: normalizeCompany(input.company),
        avatarUrl: normalizeText(input.avatarUrl),
        order: desiredOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.CREATE,
    entity: "Testimonial",
    entityId: created.id,
    newData: {
      id: created.id,
      name: created.name,
      company: created.company,
      order: created.order,
    },
  });

  return created;
};

export const getAllTestimonials = async (filters: ListTestimonialFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    company: filters.company ? normalizeCompany(filters.company) : undefined,
    OR: filters.search
      ? [
          {
            name: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            content: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ]
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.testimonial.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.testimonial.count({ where }),
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

export const updateTestimonial = async (
  testimonialId: string,
  input: UpdateTestimonialInput,
  userId?: string
) => {
  const existing = await ensureTestimonialExists(testimonialId);
  const total = await prisma.testimonial.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.testimonial.updateMany({
        where: {
          id: { not: testimonialId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.testimonial.updateMany({
        where: {
          id: { not: testimonialId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.testimonial.update({
      where: { id: testimonialId },
      data: {
        name: input.name,
        content: input.content,
        role: input.role !== undefined ? normalizeNullableText(input.role) : undefined,
        company: input.company !== undefined ? normalizeNullableCompany(input.company) : undefined,
        avatarUrl: input.avatarUrl !== undefined ? normalizeNullableText(input.avatarUrl) : undefined,
        order: targetOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.UPDATE,
    entity: "Testimonial",
    entityId: updated.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      company: existing.company,
      order: existing.order,
    },
    newData: {
      id: updated.id,
      name: updated.name,
      company: updated.company,
      order: updated.order,
    },
  });

  return updated;
};

export const deleteTestimonial = async (
  testimonialId: string,
  userId?: string
) => {
  const existing = await ensureTestimonialExists(testimonialId);

  await prisma.$transaction(async (tx) => {
    await tx.testimonial.delete({ where: { id: testimonialId } });

    await tx.testimonial.updateMany({
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
    entity: "Testimonial",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      name: existing.name,
      company: existing.company,
      order: existing.order,
    },
  });

  return { success: true };
};
