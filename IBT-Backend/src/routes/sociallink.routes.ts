import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/sociallink.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createSocialLinkSchema,
  updateSocialLinkSchema,
} from "../validators/sociallink.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllSocialLinks);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createSocialLinkSchema),
  controller.createSocialLink
);

router.patch(
  "/:socialLinkId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateSocialLinkSchema),
  controller.updateSocialLink
);

router.delete(
  "/:socialLinkId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteSocialLink
);

export default router;
