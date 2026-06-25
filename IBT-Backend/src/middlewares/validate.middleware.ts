import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        success: false,
        message: firstIssue?.message || "Validation error",
        field: firstIssue?.path?.join(".") || undefined,
        errors: result.error.flatten(),
      });
    }

    req.body = result.data;
    next();
  };