import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/internship.controller";
import { upload } from "../middlewares/multer.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.post("/request-otp", controller.requestOTP);
router.post("/submit/:category", upload.single("resume"), controller.submitApplication);

// Admin routes
router.get("/applications", authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.getAllApplications);
router.patch("/applications/:id/status", authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.updateApplicationStatus);
router.delete("/applications/:id", authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.deleteApplication);

export default router;
