import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { Request } from "express";
import { env } from "../config/env";
import { httpError } from "../utils/httpError";
import { storage as cloudinaryStorage } from "../config/cloudinary";

const uploadDirectory = path.resolve(process.cwd(), env.UPLOAD_DIR);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

export const allowedUploadCategories = new Set([
  "members",
  "partners",
  "colleges",
  "clients",
  "services",
  "blogs",
  "pages",
  "labs",
  "testimonials",
  "social-links",
  "internship",
  "misc",
]);

const getUploadCategory = (req: Request) => {
  const category = (req.params.category || "misc").toString().toLowerCase();

  if (!allowedUploadCategories.has(category)) {
    throw httpError(400, "Invalid upload category");
  }

  return category;
};

const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const category = getUploadCategory(req);
      const categoryDirectory = path.join(uploadDirectory, category);
      ensureDirectory(categoryDirectory);
      cb(null, categoryDirectory);
    } catch (error) {
      cb(error as Error, uploadDirectory);
    }
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 60);

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName || "file"}-${uniqueName}${extension}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(
      httpError(
        400,
        "Unsupported file type. Use JPG, PNG, WEBP, GIF, SVG, or PDF"
      )
    );
    return;
  }

  cb(null, true);
};

export const diskUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE,
  },
});

export const cloudinaryUpload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE,
  },
});

/**
 * Main upload middleware that prefers Cloudinary if configured, 
 * otherwise falls back to local disk storage.
 */
export const upload = env.CLOUDINARY_CLOUD_NAME ? cloudinaryUpload : diskUpload;

export const buildUploadRelativePath = (category: string, filename: string) =>
  `/uploads/${category}/${filename}`;

export const buildUploadAbsoluteUrl = (req: Request, relativePath: string) => {
  if (env.BACKEND_BASE_URL) {
    return `${env.BACKEND_BASE_URL.replace(/\/$/, "")}${relativePath}`;
  }

  return `${req.protocol}://${req.get("host")}${relativePath}`;
};
