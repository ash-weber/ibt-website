import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as clientService from "../services/client.service";
import {
  clientIdParamSchema,
  listClientQuerySchema,
} from "../validators/client.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createClient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const client = await clientService.createClient(req.body, req.user?.sub);

    res.status(201).json(successResponse(client, "Client created"));
  }
);

export const getAllClients = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseOrThrow(listClientQuerySchema, req.query);
    const result = await clientService.getAllClients(query);

    if (Array.isArray(result)) {
      return res.json(successResponse(result));
    }

    res.json(successResponse(result.items, "Success", result.meta));
  }
);

export const updateClient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { clientId } = parseOrThrow(clientIdParamSchema, req.params);
    const client = await clientService.updateClient(clientId, req.body, req.user?.sub);

    res.json(successResponse(client, "Client updated"));
  }
);

export const deleteClient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { clientId } = parseOrThrow(clientIdParamSchema, req.params);
    const result = await clientService.deleteClient(clientId, req.user?.sub);

    res.json(successResponse(result, "Client deleted"));
  }
);
