import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import { uploadAsset, uploadAssets } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/:category/multiple",
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  upload.array("files", 20),
  uploadAssets
);

router.post(
  "/:category",
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  upload.single("file"),
  uploadAsset
);

export default router;
