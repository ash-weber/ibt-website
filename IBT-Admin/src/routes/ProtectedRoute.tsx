import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearAuthStorage, hasAdminPanelAccess } from '../features/auth/storage'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '../api/auth'
import { Loader } from '../component'

export function ProtectedRoute() {
  const location = useLocation()

  if (!hasAdminPanelAccess()) {
    clearAuthStorage()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['auth-me'],
    queryFn: getMe,
    retry: false,
    staleTime: 300_000,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ui-surface)]">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
          <Loader size="md" label="Auth" />
          <p className="text-sm font-semibold text-[var(--ui-muted)]">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (isError || !user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    clearAuthStorage()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
