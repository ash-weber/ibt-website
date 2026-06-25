import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as statService from "../services/stat.service";
import {
  listStatQuerySchema,
  statIdParamSchema,
} from "../validators/stat.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createStat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stat = await statService.createStat(req.body, req.user?.sub);
  res.status(201).json(successResponse(stat, "Stat created"));
});

export const getAllStats = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(listStatQuerySchema, req.query);
  const result = await statService.getAllStats(query);

  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  res.json(successResponse(result.items, "Success", result.meta));
});

export const updateStat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { statId } = parseOrThrow(statIdParamSchema, req.params);
  const stat = await statService.updateStat(statId, req.body, req.user?.sub);

  res.json(successResponse(stat, "Stat updated"));
});

export const deleteStat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { statId } = parseOrThrow(statIdParamSchema, req.params);
  const result = await statService.deleteStat(statId, req.user?.sub);

  res.json(successResponse(result, "Stat deleted"));
});
