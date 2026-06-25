import { useEffect, useMemo, useState } from 'react'
import { FiLogOut, FiMenu, FiSettings } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearAuthStorage, getAuthUser } from '../../features/auth/storage'
import { cx } from '../../utils/cx'

type AdminNavbarProps = {
  collapsed: boolean
  onOpenMobileSidebar: () => void
  onCloseMobileSidebar?: () => void
}

const ROUTE_META: Array<{ match: (path: string) => boolean; title: string; subtitle: string }> = [
  {
    match: (path) => path === '/admin/dashboard',
    title: 'Dashboard',
    subtitle: 'Overview of system activity',
  },
  {
    match: (path) => path.startsWith('/admin/settings'),
    title: 'Settings',
    subtitle: 'Manage maintenance and platform configuration',
  },
  {
    match: (path) => path.startsWith('/admin/components'),
    title: 'Components',
    subtitle: 'Reusable UI library',
  },
  {
    match: (path) => path.startsWith('/admin/audit-logs'),
    title: 'Audit Logs',
    subtitle: 'Security and data change activity timeline',
  },
  {
    match: (path) => path.startsWith('/admin/master/services/reorder'),
    title: 'Services Reorder',
    subtitle: 'Drag and reorder all services',
  },
  {
    match: (path) => path.startsWith('/admin/master/services'),
    title: 'Services',
    subtitle: 'Paginated service management',
  },
  {
    match: (path) => path.startsWith('/admin/master/stats/reorder'),
    title: 'Stats Reorder',
    subtitle: 'Drag and reorder all stats',
  },
  {
    match: (path) => path.startsWith('/admin/master/stats'),
    title: 'Stats',
    subtitle: 'Paginated stats management',
  },
  {
    match: (path) => path.startsWith('/admin/master/testimonials/reorder'),
    title: 'Testimonials Reorder',
    subtitle: 'Drag and reorder all testimonials',
  },
  {
    match: (path) => path.startsWith('/admin/master/testimonials'),
    title: 'Testimonials',
    subtitle: 'Paginated testimonials management',
  },
  {
    match: (path) => path.startsWith('/admin/master/partners/reorder'),
    title: 'Partners Reorder',
    subtitle: 'Drag and reorder all partners',
  },
  {
    match: (path) => path.startsWith('/admin/master/partners'),
    title: 'Partners',
    subtitle: 'Paginated partners management',
  },
  {
    match: (path) => path.startsWith('/admin/master/clients/reorder'),
    title: 'Clients Reorder',
    subtitle: 'Drag and reorder all clients',
  },
  {
    match: (path) => path.startsWith('/admin/master/clients'),
    title: 'Clients',
    subtitle: 'Paginated clients management',
  },
  {
    match: (path) => path.startsWith('/admin/master/branches/reorder'),
    title: 'Branches Reorder',
    subtitle: 'Drag and reorder all branches',
  },
  {
    match: (path) => path.startsWith('/admin/master/branches/') && path.endsWith('/team/reorder'),
    title: 'Branch Team Reorder',
    subtitle: 'Drag and reorder assigned branch members',
  },
  {
    match: (path) => path.startsWith('/admin/master/branches/') && path.includes('/team'),
    title: 'Branch Team',
    subtitle: 'Paginated branch team management',
  },
  {
    match: (path) => path.startsWith('/admin/master/branches'),
    title: 'Branches',
    subtitle: 'Paginated branch management and team assignments',
  },
  {
    match: (path) => path.startsWith('/admin/master/members'),
    title: 'Team Members',
    subtitle: 'Paginated member management',
  },
  {
    match: (path) => path.startsWith('/admin/master/contacts/reorder'),
    title: 'Contacts Reorder',
    subtitle: 'Drag and reorder all contacts',
  },
  {
    match: (path) => path.startsWith('/admin/master/contacts'),
    title: 'Contacts',
    subtitle: 'Paginated contacts management',
  },
  {
    match: (path) => path.startsWith('/admin/master/blogs'),
    title: 'Blogs',
    subtitle: 'Paginated blog management',
  },
  {
    match: (path) => path.startsWith('/admin/master/lab-projects/reorder'),
    title: 'Lab Projects Reorder',
    subtitle: 'Drag and reorder all lab projects',
  },
  {
    match: (path) => path.startsWith('/admin/master/lab-projects'),
    title: 'Lab Projects',
    subtitle: 'Paginated lab projects management',
  },
  {
    match: (path) => path.startsWith('/admin/clients'),
    title: 'Clients',
    subtitle: 'Client records and organization data',
  },
  {
    match: (path) => path.startsWith('/admin/projects'),
    title: 'Projects',
    subtitle: 'Project portfolio management',
  },
  {
    match: (path) => path.startsWith('/admin/analytics'),
    title: 'Analytics',
    subtitle: 'Platform and engagement insights',
  },
]

export function AdminNavbar({ collapsed, onOpenMobileSidebar, onCloseMobileSidebar }: AdminNavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  const user = useMemo(() => getAuthUser(), [])

  const pageMeta = useMemo(() => {
    const matched = ROUTE_META.find((meta) => meta.match(location.pathname))

    if (matched) {
      return { title: matched.title, subtitle: matched.subtitle }
    }

    return { title: 'Admin', subtitle: 'Workspace management' }
  }, [location.pathname])

  const handleLogout = () => {
    clearAuthStorage()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    setProfileOpen(false)
  }, [location.pathname])

  const handleProfileToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    // Close mobile sidebar when opening profile on mobile
    onCloseMobileSidebar?.()
    setProfileOpen((prev) => !prev)
  }

  return (
    <>
      {/* Profile Modal Overlay */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/0"
          onClick={(e) => {
            e.stopPropagation()
            setProfileOpen(false)
          }}
          aria-hidden="true"
        />
      )}

      <header
        className={cx(
          'fixed right-0 top-0 z-50 h-[4.5rem] border-b border-[var(--ui-border)] bg-white/90 backdrop-blur-sm transition-all duration-300',
          collapsed ? 'lg:left-[4.5rem]' : 'lg:left-64',
          'left-0',
        )}
      >
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ui-border)] text-[var(--ui-muted)] hover:bg-[var(--ui-surface-muted)] lg:hidden"
              aria-label="Open sidebar"
              onClick={onOpenMobileSidebar}
            >
              <FiMenu />
            </button>

            {/* <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[var(--ui-border)] text-[var(--ui-muted)] hover:bg-[var(--ui-surface-muted)] lg:inline-flex"
              aria-label="Toggle sidebar width"
              onClick={onToggleCollapsed}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button> */}

            <div>
              <p className="text-sm font-semibold text-[var(--ui-text)]">{pageMeta.title}</p>
              <p className="text-xs text-[var(--ui-muted)]">{pageMeta.subtitle}</p>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold text-[var(--ui-text)]">{user?.name ?? 'Administrator'}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--ui-muted)]">{user?.role ?? 'Admin'}</p>
            </div>

            <button
              type="button"
              className="grid cursor-pointer h-10 w-10 place-items-center rounded-full bg-[var(--ui-primary-soft)] text-[var(--ui-primary-strong)] font-semibold transition-all duration-200 hover:border-[var(--ui-primary-strong)] hover:border"
              aria-label="Open profile menu"
              onClick={handleProfileToggle}
            >
              {user?.name?.slice(0, 2).toUpperCase() ?? 'US'}
            </button>

            {/* Profile Modal */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-65 z-50 rounded-xl border border-[var(--ui-border)] bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[var(--ui-primary-soft)] to-[var(--ui-primary-soft)]/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ui-primary)] text-white font-semibold text-lg">
                      {user?.name?.slice(0, 2).toUpperCase() ?? 'US'}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--ui-text)]">{user?.name ?? 'Administrator'}</p>
                      <p className="text-xs text-[var(--ui-muted)]">{user?.email ?? 'admin@ibt.local'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 space-y-2">
                  <button
                    type="button"
                    className="w-full cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--ui-border)] px-3 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition-colors"
                    onClick={() => {
                      setProfileOpen(false)
                      navigate('/admin/settings')
                    }}
                  >
                    <FiSettings size={16} />
                     Settings
                  </button>

                  <button
                    type="button"
                    className="w-full cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}