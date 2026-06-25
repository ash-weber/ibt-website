import { Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as branchService from "../services/branch.service";
import {
  branchIdParamSchema,
  branchMemberParamsSchema,
  listBranchQuerySchema,
  listBranchMembersQuerySchema,
} from "../validators/branch.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

export const createBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await branchService.createBranch(req.body, req.user?.sub);

  res.status(201).json(successResponse(branch, "Branch created"));
});

export const getAllBranches = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(listBranchQuerySchema, req.query);
  const result = await branchService.getAllBranches(query);

  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  res.json(successResponse(result.items, "Success", result.meta));
});

export const getBranchById = asyncHandler(async (req: Request, res: Response) => {
  const { branchId } = parseOrThrow(branchIdParamSchema, req.params);
  const branch = await branchService.getBranchById(branchId);

  res.json(successResponse(branch));
});

export const updateBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { branchId } = parseOrThrow(branchIdParamSchema, req.params);
  const branch = await branchService.updateBranch(branchId, req.body, req.user?.sub);

  res.json(successResponse(branch, "Branch updated"));
});

export const deleteBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { branchId } = parseOrThrow(branchIdParamSchema, req.params);
  const result = await branchService.deleteBranch(branchId, req.user?.sub);

  res.json(successResponse(result, "Branch deleted"));
});

export const getBranchMembers = asyncHandler(async (req: Request, res: Response) => {
  const { branchId } = parseOrThrow(branchIdParamSchema, req.params);
  const query = parseOrThrow(listBranchMembersQuerySchema, req.query);
  const result = await branchService.getBranchMembers(branchId, query);

  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  res.json(successResponse(result.items, "Success", result.meta));
});

export const assignMemberToBranch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { branchId } = parseOrThrow(branchIdParamSchema, req.params);
    const assignment = await branchService.assignMemberToBranch(
      branchId,
      req.body,
      req.user?.sub
    );

    res.status(201).json(successResponse(assignment, "Member assigned to branch"));
  }
);

export const updateBranchMemberOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { branchId, memberId } = parseOrThrow(branchMemberParamsSchema, req.params);
    const assignment = await branchService.updateBranchMemberOrder(
      branchId,
      memberId,
      req.body.order,
      req.user?.sub
    );

    res.json(successResponse(assignment, "Branch member order updated"));
  }
);

export const removeMemberFromBranch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { branchId, memberId } = parseOrThrow(branchMemberParamsSchema, req.params);
    const result = await branchService.removeMemberFromBranch(
      branchId,
      memberId,
      req.user?.sub
    );

    res.json(successResponse(result, "Member removed from branch"));
  }
);
