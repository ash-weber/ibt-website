import { ActionButton } from '../../../../component'
import { ActionBadge } from '../audit/ActionBadge'
import type { DashboardActivitySummary, DashboardRecentAuditLog } from '../../../../types/dashboard'

type DashboardRecentActivityProps = {
  items: DashboardRecentAuditLog[]
  summary?: DashboardActivitySummary
  onViewAll: () => void
  formatDateTime: (value: string) => string
}

function getEntityLabel(entity: string) {
  return entity
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function DashboardRecentActivity({ items, summary, onViewAll, formatDateTime }: DashboardRecentActivityProps) {
  const actionCounts = summary?.byAction ?? { CREATE: 0, UPDATE: 0, DELETE: 0, LOGIN: 0 }

  return (
    <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-5 shadow-[var(--ui-shadow-md)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ui-muted)]">Recent Activity</p>
          <p className="mt-1 text-sm text-[var(--ui-muted)]">Latest changes from admins and content managers</p>
        </div>
        <ActionButton size="sm" intent="ghost" onClick={onViewAll}>
          View All Logs
        </ActionButton>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Create: {actionCounts.CREATE}</div>
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">Update: {actionCounts.UPDATE}</div>
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">Delete: {actionCounts.DELETE}</div>
        <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-800">Login: {actionCounts.LOGIN}</div>
      </div>

      {summary?.topEntities && summary.topEntities.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--ui-muted)]">
          <span className="font-semibold uppercase tracking-[0.08em]">Top entities:</span>
          {summary.topEntities.map((item) => (
            <span key={item.entity} className="rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-2 py-1">
              {getEntityLabel(item.entity)} ({item.count})
            </span>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-5 text-sm text-[var(--ui-muted)]">
          No recent audit activity found.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((log) => (
            <article key={log.id} className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[var(--ui-border)] bg-white p-3 transition-colors hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ActionBadge action={log.action} />
                  <p className="truncate text-sm font-medium text-[var(--ui-text)]">
                    {getEntityLabel(log.entity)} #{log.entityId.slice(0, 8)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-[var(--ui-muted)]">
                  by <span className="font-medium text-[var(--ui-text)]">{log.user?.name ?? log.user?.email ?? 'System'}</span>
                </p>
              </div>
              <p className="whitespace-nowrap text-sm text-[var(--ui-muted)]">{formatDateTime(log.createdAt)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
