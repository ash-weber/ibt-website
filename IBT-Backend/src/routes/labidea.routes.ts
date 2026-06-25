import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/labIdea.controller";
import { upload } from "../middlewares/multer.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.post("/submit", upload.array("attachments", 5), controller.submitLabIdea);

// Admin routes
router.get("/admin", authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.getAllLabIdeas);
router.patch("/admin/:id/status", authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.updateLabIdeaStatus);
router.delete("/admin/:id", authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.deleteLabIdea);

export default router;
