import { FiEdit2, FiMail, FiPhone, FiTrash2, FiMove, FiLinkedin } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { MemberMasterItem } from '../../../../types/membersMaster'
import { getAbsoluteImageUrl } from '../../../../utils/image'

type MembersMasterCardProps = {
  member: MemberMasterItem
  mode?: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: MemberMasterItem) => void
  onDelete?: (itemId: string) => void
}

export function MembersMasterCard({ member, mode = 'manage', dragHandleProps, onEdit, onDelete }: MembersMasterCardProps) {
  return (
    <article className="group flex items-start gap-3 rounded-xl border border-[var(--ui-border)] bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {mode === 'reorder' ? (
        <button
          type="button"
          className="mt-1 cursor-grab rounded-md p-1 text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)] active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...(dragHandleProps?.attributes ?? {})}
          {...(dragHandleProps?.listeners ?? {})}
        >
          <FiMove size={18} />
        </button>
      ) : null}

      <img
        src={getAbsoluteImageUrl(member.avatarUrl)}
        alt={member.name}
        className="h-14 w-14 rounded-full border border-[var(--ui-border)] object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{member.name}</p>
            <p className="line-clamp-1 text-xs text-[var(--ui-muted)]">{member.role}</p>
          </div>

          {mode === 'manage' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit?.(member)}
                aria-label="Edit member"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete?.(member.id)}
                aria-label="Delete member"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-[var(--ui-muted)]">
          <FiMail size={12} />
          <span className="truncate">{member.email}</span>
        </p>

        {member.linkedinUrl && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--ui-muted)]">
            <FiLinkedin size={12} />
            <span className="truncate text-blue-600 hover:underline">
              <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn Profile
              </a>
            </span>
          </p>
        )}

        <p className="flex items-center gap-1.5 text-xs text-[var(--ui-muted)]">
          <FiPhone size={12} />
          <span className="truncate">{member.phone}</span>
        </p>

        <p className="text-xs text-[var(--ui-muted)]">
          Assigned branches: <span className="font-semibold text-[var(--ui-text)]">{member.branches.length}</span>
        </p>
      </div>
    </article>
  )
}
