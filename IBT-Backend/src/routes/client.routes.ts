import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/client.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createClientSchema,
  updateClientSchema,
} from "../validators/client.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllClients);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createClientSchema),
  controller.createClient
);

router.patch(
  "/:clientId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateClientSchema),
  controller.updateClient
);

router.delete(
  "/:clientId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteClient
);

export default router;
