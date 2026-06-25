import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/member.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../validators/member.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllMembers);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createMemberSchema),
  controller.createMember
);

router.patch(
  "/:memberId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateMemberSchema),
  controller.updateMember
);

router.delete(
  "/:memberId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteMember
);

export default router;
