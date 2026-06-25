import { Response } from "express";
import path from "node:path";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import {
  buildUploadAbsoluteUrl,
  buildUploadRelativePath,
} from "../middlewares/multer.middleware";
import { compressImage } from "../utils/imageProcessor";
import { env } from "../config/env";

const getUploadCategory = (categoryParam: unknown) =>
  (categoryParam || "misc").toString().toLowerCase();

const mapUploadedFile = (
  req: AuthRequest,
  category: string,
  file: Express.Multer.File
) => {
  // If Cloudinary is used, the URL might be in file.path or file.secure_url
  const filePath = file.path || (file as any).secure_url || (file as any).url || "";
  const isCloudinary = filePath && (filePath.startsWith("http://") || filePath.startsWith("https://"));

  const relativeUrl = isCloudinary
    ? filePath
    : buildUploadRelativePath(category, file.filename);

  const absoluteUrl = isCloudinary ? filePath : buildUploadAbsoluteUrl(req, relativeUrl);

  return {
    category,
    filename: file.filename || (isCloudinary ? filePath.split('/').pop() : ''),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    relativeUrl,
    absoluteUrl,
  };
};

export const uploadAsset = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw httpError(400, "File is required");
  }

  const category = getUploadCategory(req.params.category);

  // Compress image if it is a local file
  const filePath = req.file.path || (req.file as any).secure_url || (req.file as any).url || "";
  const isCloudinary = filePath && (filePath.startsWith("http://") || filePath.startsWith("https://"));
  
  if (!isCloudinary && req.file.filename) {
    const fullPath = path.resolve(
      process.cwd(),
      env.UPLOAD_DIR,
      category,
      req.file.filename
    );
    await compressImage(fullPath);
  }

  res.status(201).json(
    successResponse(mapUploadedFile(req, category, req.file), "File uploaded")
  );
});

export const uploadAssets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw httpError(400, "At least one file is required");
  }

  const category = getUploadCategory(req.params.category);

  // Process all files
  for (const file of files) {
    const filePath = file.path || (file as any).secure_url || (file as any).url || "";
    const isCloudinary = filePath && (filePath.startsWith("http://") || filePath.startsWith("https://"));
    
    if (!isCloudinary && file.filename) {
      const fullPath = path.resolve(
        process.cwd(),
        env.UPLOAD_DIR,
        category,
        file.filename
      );
      await compressImage(fullPath);
    }
  }

  const uploadedFiles = files.map((file) => mapUploadedFile(req, category, file));

  res.status(201).json(successResponse(uploadedFiles, "Files uploaded"));
});
