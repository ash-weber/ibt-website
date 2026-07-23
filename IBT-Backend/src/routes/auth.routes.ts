import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
//Authenticate and validate
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;