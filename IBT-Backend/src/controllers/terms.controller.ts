import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import * as termsService from "../services/terms.service";

export const getCurrentTerms = asyncHandler(async (_req: Request, res: Response) => {
  const terms = await termsService.getCurrentTerms();

  res.json(successResponse(terms));
});

export const upsertTerms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const terms = await termsService.upsertTerms(req.body, req.user?.sub);

  res.json(successResponse(terms, "Terms saved"));
});
