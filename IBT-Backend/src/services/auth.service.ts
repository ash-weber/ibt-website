import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { generateToken } from "../utils/jwt";
import { logAction } from "../utils/logAction";
import { AuditAction, Role } from "../../generated/prisma/client";
import { loginSchema } from "../validators/auth.validator";
import { z } from "zod";
import { httpError } from "../utils/httpError";
import { UAParser } from "ua-parser-js";
import { sendAdminLoginAlert } from "../utils/mailer";
import { SETTINGS } from "../types/settings";

type LoginInput = z.infer<typeof loginSchema>;

type AuthenticatedUser = {
	id: string;
	email: string;
	name: string | null;
	role: Role;
};

type LoginMeta = {
	ipAddress: string;
	userAgent: string;
};

export const loginUser = async (credentials: LoginInput, meta: LoginMeta) => {
	const parser = new UAParser(meta.userAgent);
	const browser = parser.getBrowser().name || "Unknown Browser";
	const os = parser.getOS().name || "Unknown OS";
	const device = parser.getDevice().model || parser.getDevice().type || "Desktop/Unknown";

	const user = await prisma.user.findUnique({
		where: { email: credentials.email },
		select: {
			id: true,
			email: true,
			password: true,
			name: true,
			role: true,
			isActive: true,
		},
	});

	// Dynamic email helper
	const alertAdminOfLogin = async (success: boolean) => {
		try {
			const setting = await prisma.setting.findUnique({
				where: { key: SETTINGS.ADMIN_NOTIFICATION_EMAIL },
			});
			const adminEmailRaw = typeof setting?.value === "string" && setting.value
				? setting.value
				: process.env.FALLBACK_ADMIN_EMAIL || "";

			if (adminEmailRaw) {
				const adminEmails = adminEmailRaw.split(',').map(e => e.trim()).filter(e => e);

				for (const email of adminEmails) {
					await sendAdminLoginAlert({
						adminEmail: email,
						userEmail: credentials.email,
						ipAddress: meta.ipAddress,
						browser,
						os,
						device,
						time: new Date().toLocaleString(),
						status: success ? "SUCCESS" : "FAILED",
					}).catch(err => console.error(`Login alert email failed for ${email}:`, err));
				}
			}
		} catch (err) {
			console.error("Login alert email failed:", err);
		}
	};

	// Always do comparison safely (avoid user enumeration timing leaks)
	if (!user) {
		await logAction({
			userId: undefined,
			action: AuditAction.LOGIN,
			entity: "User",
			entityId: "unknown",
			newData: {
				email: credentials.email,
				success: false,
				ipAddress: meta.ipAddress,
				browser,
				os,
				device,
			},
		});

		await alertAdminOfLogin(false);
		throw httpError(401, "Invalid email or password");
	}

	const isMatch = await bcrypt.compare(credentials.password, user.password);

	if (!isMatch) {
		await logAction({
			userId: user.id,
			action: AuditAction.LOGIN,
			entity: "User",
			entityId: user.id,
			newData: {
				email: user.email,
				success: false,
				ipAddress: meta.ipAddress,
				browser,
				os,
				device,
			},
		});

		await alertAdminOfLogin(false);
		throw httpError(401, "Invalid email or password");
	}

	if (!user.isActive) {
		throw httpError(403, "Your account is inactive");
	}

	const authUser: AuthenticatedUser = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};

	const token = generateToken({
		sub: user.id,
		role: user.role,
	});

	// Successful login log
	await logAction({
		userId: user.id,
		action: AuditAction.LOGIN,
		entity: "User",
		entityId: user.id,
		newData: {
			email: user.email,
			success: true,
			ipAddress: meta.ipAddress,
			browser,
			os,
			device,
		},
	});

	await alertAdminOfLogin(true);

	return {
		token,
		user: authUser,
	};
};