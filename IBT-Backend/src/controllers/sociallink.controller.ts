import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as socialLinkService from "../services/sociallink.service";
import {
  listSocialLinkQuerySchema,
  socialLinkIdParamSchema,
} from "../validators/sociallink.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createSocialLink = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const socialLink = await socialLinkService.createSocialLink(req.body, req.user?.sub);

    res.status(201).json(successResponse(socialLink, "Social link created"));
  }
);

export const getAllSocialLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listSocialLinkQuerySchema, req.query);
    const result = await socialLinkService.getAllSocialLinks(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const updateSocialLink = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { socialLinkId } = parseOrThrow(socialLinkIdParamSchema, req.params);
    const socialLink = await socialLinkService.updateSocialLink(
      socialLinkId,
      req.body,
      req.user?.sub
    );

    res.json(successResponse(socialLink, "Social link updated"));
  }
);

export const deleteSocialLink = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { socialLinkId } = parseOrThrow(socialLinkIdParamSchema, req.params);
    const result = await socialLinkService.deleteSocialLink(
      socialLinkId,
      req.user?.sub
    );

    res.json(successResponse(result, "Social link deleted"));
  }
);
