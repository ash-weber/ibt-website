import { Request, Response } from "express";
import { ZodSchema, z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { httpError } from "../utils/httpError";
import * as publicService from "../services/public.service";
import { prisma } from "../lib/prisma";
import { SETTINGS } from "../types/settings";
import {
  sendAdminContactNotification,
  sendUserContactAutoReply,
} from "../utils/mailer";
import {
  publicBlogListQuerySchema,
  publicBranchIdParamSchema,
  publicBranchListQuerySchema,
  publicBranchMembersQuerySchema,
  publicContactsListQuerySchema,
  publicPaginationQuerySchema,
  publicProjectListQuerySchema,
  publicServiceListQuerySchema,
  publicSettingsListQuerySchema,
  publicSlugParamSchema,
  publicStatsListQuerySchema,
  publicTermsListQuerySchema,
  publicTeamListQuerySchema,
} from "../validators/public.validator";

const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw httpError(400, firstIssue?.message || "Invalid request payload");
  }

  return parsed.data;
};

const sendMaybePaginated = <T>(res: Response, result: T[] | { items: T[]; meta: unknown }) => {
  if (Array.isArray(result)) {
    return res.json(successResponse(result));
  }

  return res.json(successResponse(result.items, "Success", result.meta));
};

export const getHome = asyncHandler(async (_req: Request, res: Response) => {
  const data = await publicService.getPublicHome();
  res.json(successResponse(data));
});

export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicBlogListQuerySchema, req.query);
  const result = await publicService.getPublicBlogs(query);
  return sendMaybePaginated(res, result);
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = parseOrThrow(publicSlugParamSchema, req.params);
  const blog = await publicService.getPublicBlogBySlug(slug);
  res.json(successResponse(blog));
});

export const getFeaturedBlogs = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, req.query);
  const result = await publicService.getPublicFeaturedBlogs(query);
  return sendMaybePaginated(res, result);
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicProjectListQuerySchema, req.query);
  const result = await publicService.getPublicProjects(query);
  return sendMaybePaginated(res, result);
});

export const getProjectBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = parseOrThrow(publicSlugParamSchema, req.params);
  const project = await publicService.getPublicProjectBySlug(slug);
  res.json(successResponse(project));
});

export const getFeaturedProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, req.query);
  const result = await publicService.getPublicFeaturedProjects(query);
  return sendMaybePaginated(res, result);
});

export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicServiceListQuerySchema, req.query);
  const result = await publicService.getPublicServices(query);
  return sendMaybePaginated(res, result);
});

export const getServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = parseOrThrow(publicSlugParamSchema, req.params);
  const service = await publicService.getPublicServiceBySlug(slug);
  res.json(successResponse(service));
});

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicTeamListQuerySchema, req.query);
  const result = await publicService.getPublicTeam(query);
  return sendMaybePaginated(res, result);
});

export const getBranches = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicBranchListQuerySchema, req.query);
  const result = await publicService.getPublicBranches(query);
  return sendMaybePaginated(res, result);
});

export const getBranchMembers = asyncHandler(async (req: Request, res: Response) => {
  const { branchId } = parseOrThrow(publicBranchIdParamSchema, req.params);
  const query = parseOrThrow(publicBranchMembersQuerySchema, req.query);
  const result = await publicService.getPublicBranchMembers(branchId, query);
  return sendMaybePaginated(res, result);
});

export const getTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, _req.query);
  const result = await publicService.getPublicTestimonials(query);
  return sendMaybePaginated(res, result);
});

export const getPartners = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, req.query);
  const result = await publicService.getPublicPartners(query);
  return sendMaybePaginated(res, result);
});

export const getPartnerColleges = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, req.query);
  const result = await publicService.getPublicPartnerColleges(query);
  return sendMaybePaginated(res, result);
});

export const getClients = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, req.query);
  const result = await publicService.getPublicClients(query);
  return sendMaybePaginated(res, result);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicStatsListQuerySchema, req.query);
  const result = await publicService.getPublicStats(query);
  return sendMaybePaginated(res, result);
});

export const getSocialLinks = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicPaginationQuerySchema, req.query);
  const result = await publicService.getPublicSocialLinks(query);
  return sendMaybePaginated(res, result);
});

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicContactsListQuerySchema, req.query);
  const result = await publicService.getPublicContacts(query);
  return sendMaybePaginated(res, result);
});

export const getTerms = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicTermsListQuerySchema, req.query);
  const result = await publicService.getPublicTerms(query);
  return sendMaybePaginated(res, result);
});

export const getCurrentTerms = asyncHandler(async (_req: Request, res: Response) => {
  const terms = await publicService.getPublicCurrentTerms();
  res.json(successResponse(terms));
});

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const query = parseOrThrow(publicSettingsListQuerySchema, req.query);
  const result = await publicService.getPublicSettings(query);
  return sendMaybePaginated(res, result);
});

export const getCurrentSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await publicService.getPublicSiteConfig();
  res.json(successResponse(data));
});

export const getSiteConfig = asyncHandler(async (_req: Request, res: Response) => {
  const data = await publicService.getPublicSiteConfig();
  res.json(successResponse(data));
});

const contactSubmitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(200).optional(),
  subject: z.string().trim().max(300).optional(),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
  const body = parseOrThrow(contactSubmitSchema, req.body);

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "Unknown";

  // Save submission to DB
  await prisma.contactSubmission.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      company: body.company ?? null,
      subject: body.subject ?? null,
      message: body.message,
      ipAddress,
    },
  });

  // Fetch notification email from settings (non-blocking fire-and-forget)
  (async () => {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: SETTINGS.ADMIN_NOTIFICATION_EMAIL },
      });
      const adminEmailRaw =
        typeof setting?.value === "string" && setting.value
          ? setting.value
          : process.env.FALLBACK_ADMIN_EMAIL || "";

      if (adminEmailRaw) {
        const adminEmails = adminEmailRaw.split(',').map(e => e.trim()).filter(e => e);

        for (const email of adminEmails) {
          await sendAdminContactNotification({
            adminEmail: email,
            userName: body.name,
            userEmail: body.email,
            userPhone: body.phone,
            userCompany: body.company,
            subject: body.subject,
            message: body.message,
          }).catch(err => console.error(`Failed to send contact notification to ${email}:`, err));
        }
      }
      await sendUserContactAutoReply({ userEmail: body.email, userName: body.name });
    } catch (err) {
      console.error("Email dispatch failed:", err);
    }
  })();

  res.status(201).json(successResponse(null, "Your message has been submitted successfully. We will be in touch shortly."));
});
