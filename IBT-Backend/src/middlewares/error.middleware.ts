import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0]?.message || "Validation error",
      errors: err.flatten(),
    });
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : err.message || "File upload failed";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};