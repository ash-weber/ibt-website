import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/branch.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  assignBranchMemberSchema,
  createBranchSchema,
  updateBranchMemberOrderSchema,
  updateBranchSchema,
} from "../validators/branch.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllBranches);
router.get("/:branchId", controller.getBranchById);
router.get("/:branchId/members", controller.getBranchMembers);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createBranchSchema),
  controller.createBranch
);

router.patch(
  "/:branchId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateBranchSchema),
  controller.updateBranch
);

router.delete(
  "/:branchId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteBranch
);

router.post(
  "/:branchId/members",
  authenticate,
  authorize(...cmsEditors),
  validate(assignBranchMemberSchema),
  controller.assignMemberToBranch
);

router.patch(
  "/:branchId/members/:memberId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateBranchMemberOrderSchema),
  controller.updateBranchMemberOrder
);

router.delete(
  "/:branchId/members/:memberId",
  authenticate,
  authorize(...cmsEditors),
  controller.removeMemberFromBranch
);

export default router;
