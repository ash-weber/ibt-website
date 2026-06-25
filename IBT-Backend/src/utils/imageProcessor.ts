import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

export const compressImage = async (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

  if (!isImage) return;

  const tempPath = `${filePath}.tmp`;

  try {
    let pipeline = sharp(filePath);

    // Standard compression settings
    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 80 });
    }

    // Resize to a maximum width if it's very large
    const metadata = await pipeline.metadata();
    if (metadata.width && metadata.width > 1920) {
      pipeline = pipeline.resize(1920, undefined, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    await pipeline.toFile(tempPath);
    await fs.unlink(filePath);
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error("Image compression failed:", error);
    // If it fails, we just keep the original file
    if (await fs.stat(tempPath).catch(() => null)) {
      await fs.unlink(tempPath);
    }
  }
};
