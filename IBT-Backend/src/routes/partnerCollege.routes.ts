import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/partnerCollege.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPartnerCollegeSchema,
  updatePartnerCollegeSchema,
} from "../validators/partnerCollege.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllPartnerColleges);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createPartnerCollegeSchema),
  controller.createPartnerCollege
);

router.patch(
  "/:partnerCollegeId",
  authenticate,
  authorize(...cmsEditors),
  validate(updatePartnerCollegeSchema),
  controller.updatePartnerCollege
);

router.delete(
  "/:partnerCollegeId",
  authenticate,
  authorize(...cmsEditors),
  controller.deletePartnerCollege
);

export default router;
