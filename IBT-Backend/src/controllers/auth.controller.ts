import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { loginUser } from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { httpError } from "../utils/httpError";
import type { AuthRequest } from "../middlewares/auth.middleware";

type LoginBody = z.infer<typeof loginSchema>;

export const login = asyncHandler(async (req: Request, res: Response) => {
	const credentials = req.body as LoginBody;

	const ipAddress =
		(req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
		req.socket.remoteAddress ||
		"Unknown";
	const userAgent = req.headers["user-agent"] || "";

	const data = await loginUser(credentials, { ipAddress, userAgent });

	res.status(200).json(successResponse(data, "Login successful"));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw httpError(401, "Unauthorized");
	}

	const user = await prisma.user.findUnique({
		where: { id: req.user.sub },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			isActive: true,
		},
	});

	if (!user) {
		throw httpError(404, "User not found");
	}

	if (!user.isActive) {
		throw httpError(403, "Your account is inactive");
	}

	res.status(200).json(successResponse(user, "User profile retrieved successfully"));
});