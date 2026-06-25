import { FiEdit2, FiMapPin, FiTrash2, FiUsers } from 'react-icons/fi'
import { ActionButton } from '../../../../../component'
import type { BranchMasterItem } from '../../../../../types/branchesMaster'

type BranchesMasterCardProps = {
  branch: BranchMasterItem
  onEdit?: (item: BranchMasterItem) => void
  onDelete?: (itemId: string) => void
  onManageTeam?: (item: BranchMasterItem) => void
}

function typeLabel(type: BranchMasterItem['type']) {
  if (type === 'HEADQUARTERS') return 'Headquarters'
  if (type === 'REGIONAL') return 'Regional'
  return 'International'
}

export function BranchesMasterCard({ branch, onEdit, onDelete, onManageTeam }: BranchesMasterCardProps) {
  return (
    <article className="group rounded-xl border border-[var(--ui-border)] bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{branch.name}</p>
          <p className="mt-1 inline-flex rounded-full bg-[var(--ui-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-primary-strong)]">
            {typeLabel(branch.type)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
            onClick={() => onEdit?.(branch)}
            aria-label="Edit branch"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type="button"
            className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete?.(branch.id)}
            aria-label="Delete branch"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--ui-muted)]">
        <FiMapPin size={12} />
        <span className="line-clamp-1">{branch.location}</span>
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--ui-muted)]">
        <FiUsers size={12} />
        <span>{branch._count.teamMembers} assigned members</span>
      </p>

      <div className="mt-4">
        <ActionButton size="sm" intent="ghost" onClick={() => onManageTeam?.(branch)}>
          Manage Team
        </ActionButton>
      </div>
    </article>
  )
}
