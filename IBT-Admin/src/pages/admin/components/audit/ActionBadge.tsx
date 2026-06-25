import { cx } from '../../../../utils/cx'
import type { AuditAction } from '../../../../types/auditLogs'

export function ActionBadge({ action }: { action: AuditAction }) {
  const styles: Record<AuditAction, string> = {
    CREATE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    UPDATE: 'border-blue-200 bg-blue-50 text-blue-700',
    DELETE: 'border-red-200 bg-red-50 text-red-700',
    LOGIN: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  return (
    <span className={cx('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold', styles[action])}>
      {action}
    </span>
  )
}
