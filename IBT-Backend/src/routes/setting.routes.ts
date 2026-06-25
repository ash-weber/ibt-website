import { Router } from "express";
import * as controller from "../controllers/setting.controller";
import { validate } from "../middlewares/validate.middleware";
import { upsertSettingSchema } from "../validators/setting.validator";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { Role } from "../../generated/prisma/client";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Admin only
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(upsertSettingSchema),
  asyncHandler(controller.upsertSetting)
);

router.get("/", asyncHandler(controller.getAllSettings));

router.get("/:key", asyncHandler(controller.getSetting));

router.delete(
  "/:key",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(controller.deleteSetting)
);

export default router;