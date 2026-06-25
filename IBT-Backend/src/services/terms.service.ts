import { AuditAction } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import { logAction } from "../utils/logAction";

type UpsertTermsInput = {
  content: string;
};

export const getCurrentTerms = async () => {
  const terms = await prisma.terms.findFirst({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  if (!terms) {
    throw httpError(404, "Terms not found");
  }

  return terms;
};

export const upsertTerms = async (input: UpsertTermsInput, userId?: string) => {
  const normalizedContent = input.content.trim();

  if (!normalizedContent) {
    throw httpError(400, "Terms content is required");
  }

  const existing = await prisma.terms.findFirst({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  const saved = existing
    ? await prisma.terms.update({
        where: { id: existing.id },
        data: { content: normalizedContent },
      })
    : await prisma.terms.create({
        data: { content: normalizedContent },
      });

  await logAction({
    userId,
    action: existing ? AuditAction.UPDATE : AuditAction.CREATE,
    entity: "Terms",
    entityId: saved.id,
    oldData: existing ? { id: existing.id, content: existing.content } : undefined,
    newData: { id: saved.id, content: saved.content },
  });

  return saved;
};
