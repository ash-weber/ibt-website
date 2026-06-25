import type { ReactNode } from 'react'
import { cx } from '@/src/utils/cx'

type BadgeVariant = 'primary' | 'danger' | 'neutral' | 'success' | 'warning'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const VARIANT_MAP: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary-strong)]',
  danger: 'bg-red-50 text-red-700',
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        VARIANT_MAP[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}