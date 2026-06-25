import { FiEdit2, FiExternalLink, FiMove, FiTrash2 } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { PartnerMasterItem } from '../../../../../types/partnersMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

type PartnersMasterCardProps = {
  partner: PartnerMasterItem
  mode: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: PartnerMasterItem) => void
  onDelete?: (itemId: string) => void
}

export function PartnersMasterCard({
  partner,
  mode,
  dragHandleProps,
  onEdit,
  onDelete,
}: PartnersMasterCardProps) {
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

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{partner.name}</p>
            <p className="text-xs text-[var(--ui-muted)]">Order #{partner.order}</p>
          </div>

          {mode === 'manage' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit?.(partner)}
                aria-label="Edit partner"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete?.(partner.id)}
                aria-label="Delete partner"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
          <img src={getAbsoluteImageUrl(partner.logoUrl)} alt={partner.name} className="h-28 w-full object-contain bg-white p-3" />
        </div>

        {partner.website ? (
          <a
            href={partner.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ui-primary)] hover:underline"
          >
            Visit website <FiExternalLink size={12} />
          </a>
        ) : (
          <p className="text-xs text-[var(--ui-muted)]">No website</p>
        )}
      </div>
    </article>
  )
}
