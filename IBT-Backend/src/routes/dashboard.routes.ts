import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/overview",
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  controller.getOverview
);

export default router;
