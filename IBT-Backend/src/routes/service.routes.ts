import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/service.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/service.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllServices);
router.get("/slug/:slug", controller.getServiceBySlug);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createServiceSchema),
  controller.createService
);

router.patch(
  "/:serviceId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateServiceSchema),
  controller.updateService
);

router.delete(
  "/:serviceId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteService
);

export default router;
