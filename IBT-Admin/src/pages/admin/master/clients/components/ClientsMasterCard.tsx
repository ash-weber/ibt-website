import { FiEdit2, FiMove, FiTrash2 } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { ClientMasterItem } from '../../../../../types/clientsMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

type ClientsMasterCardProps = {
  client: ClientMasterItem
  mode: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: ClientMasterItem) => void
  onDelete?: (itemId: string) => void
}

export function ClientsMasterCard({
  client,
  mode,
  dragHandleProps,
  onEdit,
  onDelete,
}: ClientsMasterCardProps) {
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
            <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{client.name}</p>
            {client.website ? (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 line-clamp-1 text-xs text-blue-600 hover:underline"
              >
                {client.website}
              </a>
            ) : (
              <p className="text-xs text-[var(--ui-muted)] italic">No website link</p>
            )}
            <p className="text-xs text-[var(--ui-muted)]">Order #{client.order}</p>
          </div>

          {mode === 'manage' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit?.(client)}
                aria-label="Edit client"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete?.(client.id)}
                aria-label="Delete client"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
          <img src={getAbsoluteImageUrl(client.logoUrl)} alt={client.name} className="h-28 w-full object-contain bg-white p-3" />
        </div>
      </div>
    </article>
  )
}
