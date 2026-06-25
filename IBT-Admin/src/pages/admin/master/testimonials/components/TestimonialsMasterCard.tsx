import { FiEdit2, FiMove, FiTrash2, FiUser } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { TestimonialMasterItem } from '../../../../../types/testimonialsMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

type TestimonialsMasterCardProps = {
  testimonial: TestimonialMasterItem
  mode: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: TestimonialMasterItem) => void
  onDelete?: (itemId: string) => void
}

export function TestimonialsMasterCard({
  testimonial,
  mode,
  dragHandleProps,
  onEdit,
  onDelete,
}: TestimonialsMasterCardProps) {
  return (
    <article className="group flex h-full flex-row gap-3 sm:gap-4 rounded-xl border border-[var(--ui-border)] bg-white p-3 sm:p-4 shadow-sm transition-all hover:shadow-md">
      
      {/* LEFT: Drag Handle */}
      {mode === 'reorder' && (
        <div className="flex shrink-0 items-start pt-2 sm:pt-2.5">
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

      {/* RIGHT: Content & Actions */}
      <div className="flex min-w-0 flex-1 flex-col py-0.5 relative">
        
        {/* Header Row: Avatar, Info & Action Icons */}
        <div className="flex items-start justify-between gap-3">
          
          {/* Avatar & Text Wrapper */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {testimonial.avatarUrl ? (
              <img
                src={getAbsoluteImageUrl(testimonial.avatarUrl)}
                alt={testimonial.name}
                className="size-10 shrink-0 rounded-full border border-[var(--ui-border)] object-cover"
              />
            ) : (
              <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] text-[var(--ui-muted)]">
                <FiUser size={18} />
              </div>
            )}

            {/* Name & Role - min-w-0 is critical here for truncation */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm sm:text-base font-semibold leading-tight text-[var(--ui-text)]">
                {testimonial.name}
              </p>
              <p className="truncate mt-0.5 text-[11px] sm:text-xs text-[var(--ui-muted)]">
                {[testimonial.role, testimonial.company].filter(Boolean).join(' @ ') || 'No role/company'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {mode === 'manage' && (
            <div className="flex shrink-0 items-center gap-0.5 -mt-1 -mr-1">
              <button
                type="button"
                className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                onClick={() => onEdit?.(testimonial)}
                aria-label="Edit testimonial"
                title="Edit testimonial"
              >
                <FiEdit2 size={16} className="sm:h-[18px] sm:w-[18px]" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                onClick={() => onDelete?.(testimonial.id)}
                aria-label="Delete testimonial"
                title="Delete testimonial"
              >
                <FiTrash2 size={16} className="sm:h-[18px] sm:w-[18px]" />
              </button>
            </div>
          )}
        </div>

        {/* Testimonial Quote */}
        <p className="my-4 line-clamp-3 text-sm leading-relaxed text-[var(--ui-text)] opacity-80">
          "{testimonial.content}"
        </p>

        {/* Footer Metadata */}
        <div className="absolute bottom-0 right-3 flex items-center text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[var(--ui-muted)]">
          Order #{testimonial.order}
        </div>
      </div>

    </article>
  )
}