import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as contactService from "../services/contact.service";
import {
  contactIdParamSchema,
  listContactQuerySchema,
} from "../validators/contact.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contact = await contactService.createContact(req.body, req.user?.sub);

  res.status(201).json(successResponse(contact, "Contact created"));
});

export const getAllContacts = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(listContactQuerySchema, req.query);
  const result = await contactService.getAllContacts(query);

  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  res.json(successResponse(result.items, "Success", result.meta));
});

export const updateContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { contactId } = parseOrThrow(contactIdParamSchema, req.params);
  const contact = await contactService.updateContact(contactId, req.body, req.user?.sub);

  res.json(successResponse(contact, "Contact updated"));
});

export const deleteContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { contactId } = parseOrThrow(contactIdParamSchema, req.params);
  const result = await contactService.deleteContact(contactId, req.user?.sub);

  res.json(successResponse(result, "Contact deleted"));
});
