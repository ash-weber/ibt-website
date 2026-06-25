import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as controller from "../controllers/contact.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createContactSchema,
  updateContactSchema,
} from "../validators/contact.validator";

const router = Router();
const cmsEditors = [Role.ADMIN, Role.MANAGER] as const;

router.get("/", controller.getAllContacts);

router.post(
  "/",
  authenticate,
  authorize(...cmsEditors),
  validate(createContactSchema),
  controller.createContact
);

router.patch(
  "/:contactId",
  authenticate,
  authorize(...cmsEditors),
  validate(updateContactSchema),
  controller.updateContact
);

router.delete(
  "/:contactId",
  authenticate,
  authorize(...cmsEditors),
  controller.deleteContact
);

export default router;
