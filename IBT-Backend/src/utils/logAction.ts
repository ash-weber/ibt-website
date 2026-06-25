import { prisma } from "../lib/prisma";
import { AuditAction } from "../../generated/prisma/client";

type LogActionParams = {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldData?: any;
  newData?: any;
};

export const logAction = async (params: LogActionParams) => {
  const sanitize = (data: any) => {
    if (!data) return data;
    const copy = { ...data };
    delete copy.password;
    return copy;
  };

  await prisma.auditLog
    .create({
      data: {
        ...params,
        oldData: sanitize(params.oldData),
        newData: sanitize(params.newData),
      },
    })
    .catch((err) => {
      console.error("Audit log failed:", err);
    });
};