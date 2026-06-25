// import { FiEdit2, FiMove, FiTrash2 } from 'react-icons/fi'
// import type { DraggableAttributes } from '@dnd-kit/core'
// import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
// import type { StatMasterItem } from '../../../../../types/statsMaster'

// type StatsMasterCardProps = {
//   stat: StatMasterItem
//   mode: 'manage' | 'reorder'
//   dragHandleProps?: {
//     attributes: DraggableAttributes
//     listeners?: SyntheticListenerMap
//   }
//   onEdit?: (item: StatMasterItem) => void
//   onDelete?: (itemId: string) => void
// }

// export function StatsMasterCard({
//   stat,
//   mode,
//   dragHandleProps,
//   onEdit,
//   onDelete,
// }: StatsMasterCardProps) {
//   return (
//     <article className="group flex items-start gap-3 rounded-xl border border-[var(--ui-border)] bg-white p-4 shadow-sm transition-all hover:shadow-md">
//       {mode === 'reorder' ? (
//         <button
//           type="button"
//           className="mt-1 cursor-grab rounded-md p-1 text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)] active:cursor-grabbing"
//           aria-label="Drag to reorder"
//           {...(dragHandleProps?.attributes ?? {})}
//           {...(dragHandleProps?.listeners ?? {})}
//         >
//           <FiMove size={18} />
//         </button>
//       ) : null}

//       <div className="flex min-w-0 flex-1 flex-col gap-2">
//         <div className="flex items-start justify-between gap-2">
//           <div className="min-w-0">
//             <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{stat.label}</p>
//             <p className="mt-1 text-xl font-bold text-[var(--ui-primary-strong)]">{stat.value}</p>
//           </div>

//           {mode === 'manage' ? (
//             <div className="flex items-center gap-1">
//               <button
//                 type="button"
//                 className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
//                 onClick={() => onEdit?.(stat)}
//                 aria-label="Edit stat"
//               >
//                 <FiEdit2 size={16} />
//               </button>
//               <button
//                 type="button"
//                 className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
//                 onClick={() => onDelete?.(stat.id)}
//                 aria-label="Delete stat"
//               >
//                 <FiTrash2 size={16} />
//               </button>
//             </div>
//           ) : null}
//         </div>

//         <div className="text-xs text-[var(--ui-muted)]">Order #{stat.order}</div>
//       </div>
//     </article>
//   )
// }

import { useEffect, useRef, useState } from 'react'
import { FiEdit2, FiMove, FiTrash2 } from 'react-icons/fi'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { StatMasterItem } from '../../../../../types/statsMaster'

type StatsMasterCardProps = {
  stat: StatMasterItem
  mode: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: StatMasterItem) => void
  onDelete?: (itemId: string) => void
}

export function StatsMasterCard({
  stat,
  mode,
  dragHandleProps,
  onEdit,
  onDelete,
}: StatsMasterCardProps) {
  const [count, setCount] = useState(0)
  const [startAnimation, setStartAnimation] = useState(false)

  const cardRef = useRef<HTMLElement | null>(null)

  // Detect when card enters screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Counter animation
  useEffect(() => {
    if (!startAnimation) return

    const target = parseInt(stat.value)

    if (!target) return

    let current = 0

    const timer = setInterval(() => {
      current += Math.ceil(target / 40)

      if (current >= target) {
        current = target
        clearInterval(timer)
      }

      setCount(current)
    }, 50)

    return () => clearInterval(timer)
  }, [startAnimation, stat.value])

  return (
    <article
      ref={cardRef}
      className="group flex items-start gap-3 rounded-xl border border-[var(--ui-border)] bg-white p-4 shadow-sm transition-all hover:shadow-md"
    >
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
            <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">
              {stat.label}
            </p>

            <p className="mt-1 text-xl font-bold text-[var(--ui-primary-strong)]">
              {startAnimation ? count : 0}+
            </p>
          </div>

          {mode === 'manage' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit?.(stat)}
                aria-label="Edit stat"
              >
                <FiEdit2 size={16} />
              </button>

              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete?.(stat.id)}
                aria-label="Delete stat"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="text-xs text-[var(--ui-muted)]">
          Order #{stat.order}
        </div>
      </div>
    </article>
  )
}

