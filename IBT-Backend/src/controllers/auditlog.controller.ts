import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as auditLogService from "../services/auditlog.service";
import {
  auditLogIdParamSchema,
  listAuditLogQuerySchema,
} from "../validators/auditlog.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const getAllAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(listAuditLogQuerySchema, req.query);
  const result = await auditLogService.getAllAuditLogs(query);

  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  res.json(successResponse(result.items, "Success", result.meta));
});

export const getAuditLogById = asyncHandler(async (req: Request, res: Response) => {
  const { auditLogId } = parseOrThrow(auditLogIdParamSchema, req.params);
  const auditLog = await auditLogService.getAuditLogById(auditLogId);

  res.json(successResponse(auditLog));
});
