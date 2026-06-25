import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as labProjectService from "../services/labproject.service";
import {
  labProjectIdParamSchema,
  labProjectSlugParamSchema,
  listLabProjectQuerySchema,
} from "../validators/labproject.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createLabProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const project = await labProjectService.createLabProject(req.body, req.user?.sub);

    res.status(201).json(successResponse(project, "Lab project created"));
  }
);

export const getAllLabProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listLabProjectQuerySchema, req.query);
    const result = await labProjectService.getAllLabProjects(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const getLabProjectBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = parseOrThrow(labProjectSlugParamSchema, req.params);
    const project = await labProjectService.getLabProjectBySlug(slug);

    res.json(successResponse(project));
  }
);

export const updateLabProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { labProjectId } = parseOrThrow(labProjectIdParamSchema, req.params);
    const project = await labProjectService.updateLabProject(
      labProjectId,
      req.body,
      req.user?.sub
    );

    res.json(successResponse(project, "Lab project updated"));
  }
);

export const deleteLabProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { labProjectId } = parseOrThrow(labProjectIdParamSchema, req.params);
    const result = await labProjectService.deleteLabProject(labProjectId, req.user?.sub);

    res.json(successResponse(result, "Lab project deleted"));
  }
);
