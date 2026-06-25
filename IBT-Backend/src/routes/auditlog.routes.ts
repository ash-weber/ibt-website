import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/auditlog.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorize(Role.ADMIN), controller.getAllAuditLogs);
router.get("/:auditLogId", authenticate, authorize(Role.ADMIN), controller.getAuditLogById);

export default router;
