import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/labproject.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createLabProjectSchema,
  updateLabProjectSchema,
} from "../validators/labproject.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllLabProjects);
router.get("/slug/:slug", controller.getLabProjectBySlug);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createLabProjectSchema),
  controller.createLabProject
);

router.patch(
  "/:labProjectId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateLabProjectSchema),
  controller.updateLabProject
);

router.delete(
  "/:labProjectId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteLabProject
);

export default router;
