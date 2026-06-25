import { AuditAction, ContactType } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type CreateContactInput = {
  type: ContactType;
  value: string;
  order?: number;
};

type UpdateContactInput = {
  type?: ContactType;
  value?: string;
  order?: number;
};

type ListContactFilters = {
  type?: ContactType;
  search?: string;
  page?: number;
  limit?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeValue = (value: string) => value.trim();
const phoneRegex = /^\+?[0-9()\-\s]{7,25}$/;

const normalizeForComparison = (type: ContactType, value: string) => {
  if (type === ContactType.EMAIL) {
    return value.trim().toLowerCase();
  }

  if (type === ContactType.PHONE) {
    return value.trim().replace(/[()\-\s]/g, "");
  }

  return value.trim().replace(/\s+/g, " ").toLowerCase();
};

const ensureUniqueContactValue = async (
  type: ContactType,
  value: string,
  excludeId?: string
) => {
  const normalizedInput = normalizeForComparison(type, value);

  const existing = await prisma.contact.findMany({
    where: {
      type,
      id: excludeId ? { not: excludeId } : undefined,
    },
    select: {
      id: true,
      value: true,
    },
  });

  const duplicate = existing.find(
    (item) => normalizeForComparison(type, item.value) === normalizedInput
  );

  if (duplicate) {
    throw httpError(409, `A ${type.toLowerCase()} contact with this value already exists`);
  }
};

const validateContactValueByType = (type: ContactType, value: string) => {
  if (type === ContactType.EMAIL) {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!isValidEmail) {
      throw httpError(400, "Contact value must be a valid email for EMAIL type");
    }
  }

  if (type === ContactType.PHONE && !phoneRegex.test(value)) {
    throw httpError(400, "Contact value must be a valid phone number for PHONE type");
  }

  if (type === ContactType.ADDRESS && value.length < 5) {
    throw httpError(400, "Contact value must be at least 5 characters for ADDRESS type");
  }
};

const ensureContactExists = async (contactId: string) => {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });

  if (!contact) {
    throw httpError(404, "Contact not found");
  }

  return contact;
};

export const createContact = async (input: CreateContactInput, userId?: string) => {
  const value = normalizeValue(input.value);
  validateContactValueByType(input.type, value);
  await ensureUniqueContactValue(input.type, value);

  const count = await prisma.contact.count();
  const desiredOrder = clamp(input.order ?? count + 1, 1, count + 1);

  const created = await prisma.$transaction(async (tx) => {
    await tx.contact.updateMany({
      where: { order: { gte: desiredOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.contact.create({
      data: {
        type: input.type,
        value,
        order: desiredOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.CREATE,
    entity: "Contact",
    entityId: created.id,
    newData: {
      id: created.id,
      type: created.type,
      value: created.value,
      order: created.order,
    },
  });

  return created;
};

export const getAllContacts = async (filters: ListContactFilters) => {
  const shouldPaginate = filters.page !== undefined && filters.limit !== undefined;
  const skip = shouldPaginate ? (filters.page! - 1) * filters.limit! : undefined;
  const take = shouldPaginate ? filters.limit : undefined;

  const where = {
    type: filters.type,
    value: filters.search
      ? {
          contains: filters.search,
          mode: "insensitive" as const,
        }
      : undefined,
  };

  if (!shouldPaginate) {
    return prisma.contact.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take,
    }),
    prisma.contact.count({ where }),
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

export const updateContact = async (
  contactId: string,
  input: UpdateContactInput,
  userId?: string
) => {
  const existing = await ensureContactExists(contactId);
  const nextType = input.type ?? existing.type;
  const nextValue = input.value !== undefined ? normalizeValue(input.value) : existing.value;
  validateContactValueByType(nextType, nextValue);

  const originalNormalized = normalizeForComparison(existing.type, existing.value);
  const nextNormalized = normalizeForComparison(nextType, nextValue);

  if (nextType !== existing.type || nextNormalized !== originalNormalized) {
    await ensureUniqueContactValue(nextType, nextValue, contactId);
  }

  const total = await prisma.contact.count();
  const targetOrder = input.order !== undefined ? clamp(input.order, 1, total) : existing.order;

  const updated = await prisma.$transaction(async (tx) => {
    if (targetOrder < existing.order) {
      await tx.contact.updateMany({
        where: {
          id: { not: contactId },
          order: {
            gte: targetOrder,
            lt: existing.order,
          },
        },
        data: { order: { increment: 1 } },
      });
    }

    if (targetOrder > existing.order) {
      await tx.contact.updateMany({
        where: {
          id: { not: contactId },
          order: {
            gt: existing.order,
            lte: targetOrder,
          },
        },
        data: { order: { decrement: 1 } },
      });
    }

    return tx.contact.update({
      where: { id: contactId },
      data: {
        type: input.type,
        value: input.value !== undefined ? nextValue : undefined,
        order: targetOrder,
      },
    });
  });

  await logAction({
    userId,
    action: AuditAction.UPDATE,
    entity: "Contact",
    entityId: updated.id,
    oldData: {
      id: existing.id,
      type: existing.type,
      value: existing.value,
      order: existing.order,
    },
    newData: {
      id: updated.id,
      type: updated.type,
      value: updated.value,
      order: updated.order,
    },
  });

  return updated;
};

export const deleteContact = async (contactId: string, userId?: string) => {
  const existing = await ensureContactExists(contactId);

  await prisma.$transaction(async (tx) => {
    await tx.contact.delete({ where: { id: contactId } });

    await tx.contact.updateMany({
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
    entity: "Contact",
    entityId: existing.id,
    oldData: {
      id: existing.id,
      type: existing.type,
      value: existing.value,
      order: existing.order,
    },
  });

  return { success: true };
};
