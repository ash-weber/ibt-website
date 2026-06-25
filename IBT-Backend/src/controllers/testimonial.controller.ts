import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as testimonialService from "../services/testimonial.service";
import {
  listTestimonialQuerySchema,
  testimonialIdParamSchema,
} from "../validators/testimonial.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createTestimonial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const testimonial = await testimonialService.createTestimonial(
      req.body,
      req.user?.sub
    );

    res.status(201).json(successResponse(testimonial, "Testimonial created"));
  }
);

export const getAllTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listTestimonialQuerySchema, req.query);
    const result = await testimonialService.getAllTestimonials(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const updateTestimonial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { testimonialId } = parseOrThrow(testimonialIdParamSchema, req.params);
    const testimonial = await testimonialService.updateTestimonial(
      testimonialId,
      req.body,
      req.user?.sub
    );

    res.json(successResponse(testimonial, "Testimonial updated"));
  }
);

export const deleteTestimonial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { testimonialId } = parseOrThrow(testimonialIdParamSchema, req.params);
    const result = await testimonialService.deleteTestimonial(
      testimonialId,
      req.user?.sub
    );

    res.json(successResponse(result, "Testimonial deleted"));
  }
);
