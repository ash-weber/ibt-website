import { AuditAction } from "../../generated/prisma/client";
import { z } from "zod";

const parseAuditAction = (value: unknown) => {
  if (typeof value === "string") {
    const normalized = value.toUpperCase();

    if (normalized in AuditAction) {
      return normalized;
    }
  }

  return value;
};

const parseDate = (value: unknown) => {
  if (value === undefined || value === "") return undefined;
  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed;
  }

  return value;
};

export const auditLogIdParamSchema = z.object({
  auditLogId: z.string().uuid("Invalid auditLogId format"),
});

export const listAuditLogQuerySchema = z
  .object({
    action: z.preprocess(parseAuditAction, z.nativeEnum(AuditAction).optional()),
    entity: z.string().trim().min(1).max(80).optional(),
    entityId: z.string().trim().min(1).max(80).optional(),
    userId: z.string().uuid("userId must be a valid UUID").optional(),
    search: z.string().trim().min(1).max(120).optional(),
    from: z.preprocess(parseDate, z.date().optional()),
    to: z.preprocess(parseDate, z.date().optional()),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((data) => (data.page === undefined) === (data.limit === undefined), {
    message: "Both page and limit are required for pagination",
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return data.from.getTime() <= data.to.getTime();
    },
    {
      message: "from must be before or equal to to",
      path: ["from"],
    }
  );
