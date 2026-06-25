import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import { getDashboardOverview } from "../services/dashboard.service";
import { dashboardOverviewQuerySchema } from "../validators/dashboard.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(dashboardOverviewQuerySchema, req.query);
  const overview = await getDashboardOverview(query);

  res.json(successResponse(overview));
});
