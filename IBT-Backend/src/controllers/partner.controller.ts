import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as partnerService from "../services/partner.service";
import {
  listPartnerQuerySchema,
  partnerIdParamSchema,
} from "../validators/partner.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createPartner = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const partner = await partnerService.createPartner(req.body, req.user?.sub);

    res.status(201).json(successResponse(partner, "Partner created"));
  }
);

export const getAllPartners = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listPartnerQuerySchema, req.query);
    const result = await partnerService.getAllPartners(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const updatePartner = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { partnerId } = parseOrThrow(partnerIdParamSchema, req.params);
    const partner = await partnerService.updatePartner(
      partnerId,
      req.body,
      req.user?.sub
    );

    res.json(successResponse(partner, "Partner updated"));
  }
);

export const deletePartner = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { partnerId } = parseOrThrow(partnerIdParamSchema, req.params);
    const result = await partnerService.deletePartner(partnerId, req.user?.sub);

    res.json(successResponse(result, "Partner deleted"));
  }
);
