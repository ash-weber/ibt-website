import { z } from "zod";

export const dashboardOverviewQuerySchema = z.object({
  recentLimit: z.coerce.number().int().min(1).max(20).default(6),
  trendDays: z.coerce.number().int().min(7).max(30).default(14),
});
