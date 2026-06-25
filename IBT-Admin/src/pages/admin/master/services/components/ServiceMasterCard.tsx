import { FiEdit2, FiMove, FiTrash2, FiImage } from 'react-icons/fi'
import { FiArrowRight } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { ServiceMasterItem } from '../../../../../types/servicesMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

type ServiceMasterCardProps = {
  service: ServiceMasterItem
  mode: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: ServiceMasterItem) => void
  onDelete?: (itemId: string) => void
  onViewDetails?: (item: ServiceMasterItem) => void
}

export function ServiceMasterCard({
  service,
  mode,
  dragHandleProps,
  onEdit,
  onDelete,
  onViewDetails,
}: ServiceMasterCardProps) {
  return (
    <article className="group flex flex-row gap-3 sm:gap-4 rounded-xl border border-[var(--ui-border)] bg-white p-3 sm:p-4 shadow-sm transition-all hover:shadow-md">
      
      {/* LEFT: Drag Handle & Image */}
      <div className="flex shrink-0 items-start gap-2 sm:gap-3">
        {mode === 'reorder' && (
          <div className="flex h-20 sm:h-24 items-center">
            <button
              type="button"
              className="cursor-grab p-1 text-[var(--ui-muted)] transition-colors hover:text-[var(--ui-text)] active:cursor-grabbing"
              aria-label="Drag to reorder"
              {...(dragHandleProps?.attributes ?? {})}
              {...(dragHandleProps?.listeners ?? {})}
            >
              <FiMove size={18} />
            </button>
          </div>
        )}

        <div className="size-20 sm:h-24 sm:w-32 shrink-0 overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
          {service.imageUrl ? (
            <img 
              src={getAbsoluteImageUrl(service.imageUrl)} 
              alt={service.title} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-[var(--ui-muted)]">
              <FiImage size={18} className="sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">No image</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Content & Actions */}
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        
        {/* Header Row: Title & Action Icons */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold leading-tight text-[var(--ui-text)]">
            {service.title}
          </h3>
          
          {mode === 'manage' && (
            <div className="flex shrink-0 items-center gap-0.5 -mt-1 -mr-1">
              <button
                type="button"
                onClick={() => onViewDetails?.(service)}
                className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-purple-50 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                aria-label="View details and manage info cards"
                title="View details and manage info cards"
              >
                <FiArrowRight size={16} className="sm:h-[18px] sm:w-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => onEdit?.(service)}
                className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                aria-label="Edit service"
                title="Edit service"
              >
                <FiEdit2 size={16} className="sm:h-[18px] sm:w-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(service.id)}
                className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                aria-label="Delete service"
                title="Delete service"
              >
                <FiTrash2 size={16} className="sm:h-[18px] sm:w-[18px]" />
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[var(--ui-muted)]">
          <span className="rounded bg-[var(--ui-surface-muted)] px-1.5 py-0.5 font-mono">
            /{service.slug}
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Order #{service.order}</span>
        </div>

        {/* Description */}
        <p className="mt-2 hidden sm:-webkit-box sm:line-clamp-2 text-sm leading-relaxed text-[var(--ui-text)] opacity-80">
          {service.description}
        </p>

        {/* Tags */}
        {service.tags.length > 0 && (
          <div className="mt-2 sm:mt-auto sm:pt-3 flex flex-wrap gap-1.5">
            {service.tags.map((tag) => (
              <span
                key={`${service.id}-${tag}`}
                className="rounded-md bg-[var(--ui-primary-soft)] px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-[11px] font-medium text-[var(--ui-primary-strong)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

    </article>
  )
}