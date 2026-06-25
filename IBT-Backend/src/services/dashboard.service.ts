import { AuditAction, BlogStatus, LabStatus } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";

type DashboardOverviewFilters = {
  recentLimit: number;
  trendDays: number;
};

type TrendPoint = {
  date: string;
  label: string;
  blogsCreated: number;
  projectsCreated: number;
  totalCreated: number;
};

const buildStatusMap = <T extends string>(
  keys: readonly T[],
  rows: Array<{ status: T; _count: { _all: number } }>
) => {
  const mapped = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;

  for (const row of rows) {
    mapped[row.status] = row._count._all;
  }

  return mapped;
};

const toUtcDayStart = (value: Date) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

const getTrendSeries = (
  trendDays: number,
  blogRows: Array<{ createdAt: Date }>,
  projectRows: Array<{ createdAt: Date }>
): TrendPoint[] => {
  const today = new Date();
  const startDay = toUtcDayStart(new Date(today));
  startDay.setUTCDate(startDay.getUTCDate() - (trendDays - 1));

  const points: TrendPoint[] = Array.from({ length: trendDays }, (_, index) => {
    const day = new Date(startDay);
    day.setUTCDate(startDay.getUTCDate() + index);

    return {
      date: day.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(day),
      blogsCreated: 0,
      projectsCreated: 0,
      totalCreated: 0,
    };
  });

  const indexByDate = new Map(points.map((point, index) => [point.date, index]));

  for (const row of blogRows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const index = indexByDate.get(key);

    if (index !== undefined) {
      points[index].blogsCreated += 1;
      points[index].totalCreated += 1;
    }
  }

  for (const row of projectRows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const index = indexByDate.get(key);

    if (index !== undefined) {
      points[index].projectsCreated += 1;
      points[index].totalCreated += 1;
    }
  }

  return points;
};

export const getDashboardOverview = async ({ recentLimit, trendDays }: DashboardOverviewFilters) => {
  const trendStart = toUtcDayStart(new Date());
  trendStart.setUTCDate(trendStart.getUTCDate() - (trendDays - 1));

  const [
    services,
    stats,
    testimonials,
    partners,
    partnerColleges,
    clients,
    branches,
    members,
    contacts,
    blogs,
    labProjects,
    featuredBlogs,
    featuredLabProjects,
    groupedBlogs,
    groupedLabProjects,
    recentAuditLogs,
    trendBlogs,
    trendProjects,
  ] = await Promise.all([
    prisma.service.count(),
    prisma.stat.count(),
    prisma.testimonial.count(),
    prisma.partner.count(),
    prisma.partnerCollege.count(),
    prisma.client.count(),
    prisma.branch.count(),
    prisma.member.count(),
    prisma.contact.count(),
    prisma.blog.count(),
    prisma.labProject.count(),
    prisma.blog.count({ where: { featured: true } }),
    prisma.labProject.count({ where: { featured: true } }),
    prisma.blog.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.labProject.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: recentLimit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.blog.findMany({
      where: {
        createdAt: {
          gte: trendStart,
        },
      },
      select: { createdAt: true },
    }),
    prisma.labProject.findMany({
      where: {
        createdAt: {
          gte: trendStart,
        },
      },
      select: { createdAt: true },
    }),
  ]);

  const trends = getTrendSeries(trendDays, trendBlogs, trendProjects);
  const byAction = Object.fromEntries(
    Object.values(AuditAction).map((action) => [action, 0])
  ) as Record<AuditAction, number>;
  const byEntity = new Map<string, number>();

  for (const log of recentAuditLogs) {
    byAction[log.action] += 1;
    byEntity.set(log.entity, (byEntity.get(log.entity) ?? 0) + 1);
  }

  const topEntities = [...byEntity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([entity, count]) => ({ entity, count }));

  let dbConnected = true;

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
  } catch {
    dbConnected = false;
  }

  return {
    summary: {
      counts: {
        services,
        stats,
        testimonials,
        partners,
        partnerColleges,
        clients,
        branches,
        members,
        contacts,
        blogs,
        labProjects,
      },
      status: {
        blogsByStatus: buildStatusMap(Object.values(BlogStatus), groupedBlogs),
        labProjectsByStatus: buildStatusMap(Object.values(LabStatus), groupedLabProjects),
      },
      featured: {
        blogs: featuredBlogs,
        labProjects: featuredLabProjects,
      },
    },
    activity: {
      recentAuditLogs,
      summary: {
        totalRecent: recentAuditLogs.length,
        byAction,
        topEntities,
      },
    },
    trends,
    health: {
      dbConnected,
      serverTime: new Date().toISOString(),
    },
  };
};
