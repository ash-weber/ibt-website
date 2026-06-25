import { memo } from 'react'
import { FiEdit2, FiTrash2, FiImage, FiStar, FiMove } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { LabProjectMasterItem, LabProjectStatus } from '../../../../../types/labProjectsMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

type LabProjectsMasterCardProps = {
  mode: 'manage' | 'reorder'
  project: LabProjectMasterItem
  deleting?: boolean
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: LabProjectMasterItem) => void
  onDelete?: (itemId: string) => void
}

function getStatusIndicator(status: LabProjectStatus) {
  switch (status) {
    case 'COMPLETED':
      return <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" title="Completed" />
    case 'ARCHIVED':
      return <div className="size-2 rounded-full bg-gray-400" title="Archived" />
    default:
      return <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" title="Ongoing" />
  }
}

export const LabProjectsMasterCard = memo(function LabProjectsMasterCard({
  mode,
  project,
  deleting = false,
  dragHandleProps,
  onEdit,
  onDelete,
}: LabProjectsMasterCardProps) {
  return (
    <article className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-[var(--ui-border)] bg-white p-3 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-md">
      {mode === 'reorder' && (
        <div className="flex h-16 sm:h-20 items-center pl-1">
          <button
            type="button"
            className="cursor-grab rounded-md p-1 text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)] active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...(dragHandleProps?.attributes ?? {})}
            {...(dragHandleProps?.listeners ?? {})}
          >
            <FiMove size={18} />
          </button>
        </div>
      )}

      <div className="relative shrink-0">
        <div className="size-16 sm:size-20 overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
          {project.imageUrl ? (
            <img
              src={getAbsoluteImageUrl(project.imageUrl)}
              alt={project.title}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--ui-muted)]">
              <FiImage size={20} />
            </div>
          )}
        </div>

        {project.featured && (
          <div className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-600 shadow-sm">
            <FiStar size={10} className="fill-current" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <div className="flex items-center gap-2.5">
          {getStatusIndicator(project.status)}
          <h3 className="truncate text-sm font-bold text-[var(--ui-text)]">{project.title || 'Untitled Project'}</h3>
          <span className="hidden sm:inline-block shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
            /{project.slug || 'no-route'}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 sm:line-clamp-2 text-xs leading-relaxed text-[var(--ui-muted)]">
          {project.description || <span className="italic opacity-60">No description provided.</span>}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
          <span className="font-medium text-gray-700">Order #{project.order ?? '-'}</span>

          {project.techStack?.length > 0 && (
            <>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="truncate max-w-[150px] sm:max-w-none">{project.techStack.join(', ')}</span>
            </>
          )}

          {project.tags?.length > 0 && (
            <>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="truncate max-w-[150px] sm:max-w-none text-blue-600/70">#{project.tags.join(' #')}</span>
            </>
          )}
        </div>
      </div>

      {mode === 'manage' ? (
        <div className="absolute right-3 top-3 sm:static sm:flex shrink-0 items-center gap-1 sm:pl-4 sm:border-l sm:border-[var(--ui-border)] sm:py-2">
          <button
            type="button"
            onClick={() => onEdit?.(project)}
            disabled={deleting}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Edit project"
            title="Edit project"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(project.id)}
            disabled={deleting}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            aria-label="Delete project"
            title="Delete project"
          >
            <FiTrash2 size={16} className={deleting ? 'animate-pulse text-red-400' : ''} />
          </button>
        </div>
      ) : null}
    </article>
  )
})
