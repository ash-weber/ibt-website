import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as memberService from "../services/member.service";
import {
  listMemberQuerySchema,
  memberIdParamSchema,
} from "../validators/member.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await memberService.createMember(req.body, req.user?.sub);

  res.status(201).json(successResponse(member, "Member created"));
});

export const getAllMembers = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(listMemberQuerySchema, req.query);
  const result = await memberService.getAllMembers(query);

  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  res.json(successResponse(result.items, "Success", result.meta));
});

export const updateMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { memberId } = parseOrThrow(memberIdParamSchema, req.params);
  const member = await memberService.updateMember(memberId, req.body, req.user?.sub);

  res.json(successResponse(member, "Member updated"));
});

export const deleteMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { memberId } = parseOrThrow(memberIdParamSchema, req.params);
  const result = await memberService.deleteMember(memberId, req.user?.sub);

  res.json(successResponse(result, "Member deleted"));
});
