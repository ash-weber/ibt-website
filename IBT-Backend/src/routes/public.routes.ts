import { Router } from "express";
import * as controller from "../controllers/public.controller";

const router = Router();

router.get("/home", controller.getHome);

router.get("/blogs", controller.getBlogs);
router.get("/featured-blogs", controller.getFeaturedBlogs);
router.get("/blogs/slug/:slug", controller.getBlogBySlug);

router.get("/projects", controller.getProjects);
router.get("/featured-projects", controller.getFeaturedProjects);
router.get("/projects/slug/:slug", controller.getProjectBySlug);

router.get("/services", controller.getServices);
router.get("/services/slug/:slug", controller.getServiceBySlug);

router.get("/team", controller.getTeam);
router.get("/branches", controller.getBranches);
router.get("/branches/:branchId/members", controller.getBranchMembers);

router.get("/testimonials", controller.getTestimonials);
router.get("/partners", controller.getPartners);
router.get("/partner-colleges", controller.getPartnerColleges);
router.get("/clients", controller.getClients);
router.get("/stats", controller.getStats);
router.get("/social-links", controller.getSocialLinks);
router.get("/contacts", controller.getContacts);
router.get("/terms", controller.getTerms);
router.get("/terms/current", controller.getCurrentTerms);
router.get("/settings/current", controller.getCurrentSettings);
router.get("/settings", controller.getSettings);
router.get("/site-config", controller.getSiteConfig);

// Contact Form Submission
router.post("/contact/submit", controller.submitContactForm);

export default router;

