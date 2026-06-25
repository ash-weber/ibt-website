import { Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/client";
import { AuthRequest } from "./auth.middleware";

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };