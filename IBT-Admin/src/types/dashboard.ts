export type DashboardCountSummary = {
  services: number
  stats: number
  testimonials: number
  partners: number
  partnerColleges: number
  clients: number
  branches: number
  members: number
  contacts: number
  blogs: number
  labProjects: number
}

export type DashboardStatusSummary = {
  blogsByStatus: {
    DRAFT: number
    PUBLISHED: number
    ARCHIVED: number
  }
  labProjectsByStatus: {
    ONGOING: number
    COMPLETED: number
    ARCHIVED: number
  }
}

export type DashboardFeaturedSummary = {
  blogs: number
  labProjects: number
}

export type DashboardRecentAuditLog = {
  id: string
  userId: string | null
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN'
  entity: string
  entityId: string
  oldData: unknown
  newData: unknown
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
    role: string
  } | null
}

export type DashboardTrendPoint = {
  date: string
  label: string
  blogsCreated: number
  projectsCreated: number
  totalCreated: number
}

export type DashboardActivitySummary = {
  totalRecent: number
  byAction: {
    CREATE: number
    UPDATE: number
    DELETE: number
    LOGIN: number
  }
  topEntities: Array<{
    entity: string
    count: number
  }>
}

export type DashboardOverview = {
  summary: {
    counts: DashboardCountSummary
    status: DashboardStatusSummary
    featured: DashboardFeaturedSummary
  }
  activity: {
    recentAuditLogs: DashboardRecentAuditLog[]
    summary: DashboardActivitySummary
  }
  trends: DashboardTrendPoint[]
  health: {
    dbConnected: boolean
    serverTime: string
  }
}
