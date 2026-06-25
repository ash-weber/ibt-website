import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/terms.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { upsertTermsSchema } from "../validators/terms.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getCurrentTerms);

router.put(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(upsertTermsSchema),
  controller.upsertTerms
);

export default router;
