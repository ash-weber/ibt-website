import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import * as settingService from "../services/setting.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const upsertSetting = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { key, value } = req.body;

    const setting = await settingService.upsertSetting(
      key,
      value,
      req.user?.sub
    );

    res.json(successResponse(setting, "Setting saved"));
  }
);

export const getSetting = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params as { key: string };

  const setting = await settingService.getSetting(key);

  res.json(successResponse(setting));
});

export const getAllSettings = asyncHandler(
  async (_req: Request, res: Response) => {
    const settings = await settingService.getAllSettings();

    res.json(successResponse(settings));
  }
);

export const deleteSetting = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { key } = req.params as { key: string };

    const result = await settingService.deleteSetting(
      key,
      req.user?.sub
    );

    res.json(successResponse(result, "Setting deleted"));
  }
);