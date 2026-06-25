import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as serviceService from "../services/service.service";
import {
  listServiceQuerySchema,
  serviceIdParamSchema,
  serviceSlugParamSchema,
} from "../validators/service.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createService = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const service = await serviceService.createService(req.body, req.user?.sub);

    res.status(201).json(successResponse(service, "Service created"));
  }
);

export const getAllServices = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listServiceQuerySchema, req.query);
    const result = await serviceService.getAllServices(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const getServiceBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = parseOrThrow(serviceSlugParamSchema, req.params);
    const service = await serviceService.getServiceBySlug(slug);

    res.json(successResponse(service));
  }
);

export const updateService = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { serviceId } = parseOrThrow(serviceIdParamSchema, req.params);
    const service = await serviceService.updateService(
      serviceId,
      req.body,
      req.user?.sub
    );

    res.json(successResponse(service, "Service updated"));
  }
);

export const deleteService = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { serviceId } = parseOrThrow(serviceIdParamSchema, req.params);
    const result = await serviceService.deleteService(serviceId, req.user?.sub);

    res.json(successResponse(result, "Service deleted"));
  }
);
