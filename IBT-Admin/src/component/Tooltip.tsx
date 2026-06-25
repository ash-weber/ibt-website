import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../utils/cx'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom'
  className?: string
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [resolvedPosition, setResolvedPosition] = useState<'top' | 'bottom'>(position)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) {
      return
    }

    const PADDING = 8
    const GAP = 8
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    const spaceAbove = triggerRect.top
    const spaceBelow = window.innerHeight - triggerRect.bottom
    const neededHeight = tooltipRect.height + GAP

    let nextPosition: 'top' | 'bottom' = position
    if (position === 'top' && spaceAbove < neededHeight && spaceBelow > spaceAbove) {
      nextPosition = 'bottom'
    }
    if (position === 'bottom' && spaceBelow < neededHeight && spaceAbove > spaceBelow) {
      nextPosition = 'top'
    }

    if (nextPosition !== resolvedPosition) {
      setResolvedPosition(nextPosition)
      return
    }

    const centeredLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
    const minLeft = PADDING
    const maxLeft = window.innerWidth - tooltipRect.width - PADDING
    const clampedLeft = Math.min(Math.max(centeredLeft, minLeft), maxLeft)
    const shift = clampedLeft - centeredLeft
    setOffsetX(shift)
  }, [visible, position, resolvedPosition])

  useLayoutEffect(() => {
    if (!visible) {
      setResolvedPosition(position)
      setOffsetX(0)
    }
  }, [position, visible])

  return (
    <span
      ref={triggerRef}
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible ? (
        <span
          ref={tooltipRef}
          role="tooltip"
          style={{ transform: `translateX(calc(-50% + ${offsetX}px))` }}
          className={cx(
            'pointer-events-none absolute left-1/2 z-50 whitespace-nowrap rounded-md bg-[var(--ui-text)] px-2 py-1 text-xs font-medium text-white shadow-[var(--ui-shadow-md)]',
            resolvedPosition === 'top' ? 'bottom-[calc(100%+0.45rem)]' : 'top-[calc(100%+0.45rem)]',
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}
