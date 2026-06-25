import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/partner.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPartnerSchema,
  updatePartnerSchema,
} from "../validators/partner.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllPartners);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createPartnerSchema),
  controller.createPartner
);

router.patch(
  "/:partnerId",
  authenticate,
  authorize(...cmsEditors),
  validate(updatePartnerSchema),
  controller.updatePartner
);

router.delete(
  "/:partnerId",
  authenticate,
  authorize(...cmsEditors),
  controller.deletePartner
);

export default router;
