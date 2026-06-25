import type { AuditLogItem } from '../../../../types/auditLogs'
import { ActionBadge } from './ActionBadge'

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

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return 'N/A'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function AuditLogDetailContent({ item }: { item: AuditLogItem }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Action</p>
          <div className="mt-1"><ActionBadge action={item.action} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Timestamp</p>
          <p className="mt-1 text-sm text-[var(--ui-text)]">{formatDateTime(item.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Entity</p>
          <p className="mt-1 text-sm text-[var(--ui-text)]">{item.entity}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Entity ID</p>
          <p className="mt-1 break-all text-sm text-[var(--ui-text)]">{item.entityId}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">User</p>
          <p className="mt-1 text-sm text-[var(--ui-text)]">
            {item.user?.name ?? 'System'} ({item.user?.email ?? 'N/A'})
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--ui-border)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Old Data</p>
          <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-[var(--ui-surface-muted)] p-3 text-xs leading-relaxed text-[var(--ui-text)]">{formatJson(item.oldData)}</pre>
        </div>

        <div className="rounded-xl border border-[var(--ui-border)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">New Data</p>
          <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-[var(--ui-surface-muted)] p-3 text-xs leading-relaxed text-[var(--ui-text)]">{formatJson(item.newData)}</pre>
        </div>
      </div>
    </div>
  )
}
