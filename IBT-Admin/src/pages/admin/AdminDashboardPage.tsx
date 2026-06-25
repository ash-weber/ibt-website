import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getDashboardOverview } from '../../api/dashboard'
import { ActionButton, Loader } from '../../component'
import { DashboardKpiGrid } from './components/dashboard/DashboardKpiGrid'
import { DashboardRecentActivity } from './components/dashboard/DashboardRecentActivity'


type ApiError = {
  message?: string
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function formatDateTime(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => getDashboardOverview({ recentLimit: 10, trendDays: 14 }),
    staleTime: 30_000,
  })

  const overview = overviewQuery.data
  const counts = overview?.summary.counts
  const featured = overview?.summary.featured
  const recentActivity = overview?.activity.recentAuditLogs ?? []
  const activitySummary = overview?.activity.summary

  const countsSafe = {
    services: counts?.services ?? 0,
    stats: counts?.stats ?? 0,
    testimonials: counts?.testimonials ?? 0,
    partners: counts?.partners ?? 0,
    partnerColleges: counts?.partnerColleges ?? 0,
    clients: counts?.clients ?? 0,
    branches: counts?.branches ?? 0,
    members: counts?.members ?? 0,
    contacts: counts?.contacts ?? 0,
    blogs: counts?.blogs ?? 0,
    labProjects: counts?.labProjects ?? 0,
  }

  const featuredSafe = {
    blogs: featured?.blogs ?? 0,
    labProjects: featured?.labProjects ?? 0,
  }

  if (overviewQuery.isPending) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <div className="flex items-center gap-3 rounded-lg border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
              <Loader size="md" label="Dashboard" />
              <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading dashboard...</p>
            </div>
      </div>
    )
  }

  if (overviewQuery.isError) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-(--ui-radius-lg) border border-red-200 bg-red-50 p-8 text-center shadow-(--ui-shadow-md)">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load dashboard</p>
          <p className="mt-1 text-sm text-red-700">
            {getApiErrorMessage(overviewQuery.error, 'Unable to load dashboard overview.')}
          </p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => overviewQuery.refetch()} leftIcon={<FiRefreshCw />}>
              Retry
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex w-full flex-col gap-4 p-4">
      <DashboardKpiGrid
        counts={{
          services: countsSafe.services,
          blogs: countsSafe.blogs,
          labProjects: countsSafe.labProjects,
          branches: countsSafe.branches,
          members: countsSafe.members,
          clients: countsSafe.clients,
          partners: countsSafe.partners,
          partnerColleges: countsSafe.partnerColleges,
        }}
        featured={featuredSafe}
      />



      <DashboardRecentActivity
        items={recentActivity}
        summary={activitySummary}
        onViewAll={() => navigate('/admin/audit-logs')}
        formatDateTime={formatDateTime}
      />
    </div>
  )
}
