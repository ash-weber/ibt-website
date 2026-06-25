import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as partnerCollegeService from "../services/partnerCollege.service";
import {
  listPartnerCollegeQuerySchema,
  partnerCollegeIdParamSchema,
} from "../validators/partnerCollege.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createPartnerCollege = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const college = await partnerCollegeService.createPartnerCollege(req.body, req.user?.sub);

    res.status(201).json(successResponse(college, "Partner College created"));
  }
);

export const getAllPartnerColleges = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listPartnerCollegeQuerySchema, req.query);
    const result = await partnerCollegeService.getAllPartnerColleges(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const updatePartnerCollege = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { partnerCollegeId } = parseOrThrow(partnerCollegeIdParamSchema, req.params);
    const college = await partnerCollegeService.updatePartnerCollege(
      partnerCollegeId,
      req.body,
      req.user?.sub
    );

    res.json(successResponse(college, "Partner College updated"));
  }
);

export const deletePartnerCollege = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { partnerCollegeId } = parseOrThrow(partnerCollegeIdParamSchema, req.params);
    const result = await partnerCollegeService.deletePartnerCollege(partnerCollegeId, req.user?.sub);

    res.json(successResponse(result, "Partner College deleted"));
  }
);
