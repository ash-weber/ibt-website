import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/stat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createStatSchema, updateStatSchema } from "../validators/stat.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllStats);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createStatSchema),
  controller.createStat
);

router.patch(
  "/:statId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateStatSchema),
  controller.updateStat
);

router.delete(
  "/:statId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteStat
);

export default router;
