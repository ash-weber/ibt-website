import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi'
import { cx } from '@/src/utils/cx'

type ToastVariant = 'success' | 'error'

type ToastProps = {
  open: boolean
  message: string
  onClose: () => void
  variant?: ToastVariant
  title?: string
  durationMs?: number
}

const VARIANT_STYLES: Record<ToastVariant, { icon: ReactNode; panel: string; iconWrap: string; title: string; text: string }> = {
  success: {
    icon: <FiCheckCircle size={17} />,
    panel: 'border-emerald-200 bg-white',
    iconWrap: 'bg-emerald-50 text-emerald-600',
    title: 'text-emerald-800',
    text: 'text-emerald-700',
  },
  error: {
    icon: <FiAlertCircle size={17} />,
    panel: 'border-red-200 bg-white',
    iconWrap: 'bg-red-50 text-red-600',
    title: 'text-red-800',
    text: 'text-red-700',
  },
}

export function Toast({
  open,
  message,
  onClose,
  variant = 'error',
  title,
  durationMs = 3600,
}: ToastProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => onClose(), durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs, onClose, open])

  const styles = VARIANT_STYLES[variant]

  return (
    <div
      className={cx(
        'pointer-events-none fixed right-4 top-4 z-100 w-[calc(100vw-2rem)] max-w-sm transition-all duration-200',
        open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={cx(open ? 'pointer-events-auto' : 'pointer-events-none', 'rounded-2xl border shadow-[var(--ui-shadow-md)]', styles.panel)}>
        <div className="flex items-start gap-3 p-4">
          <div className={cx('mt-0.5 rounded-lg p-2', styles.iconWrap)}>{styles.icon}</div>

          <div className="flex-1">
            <p className={cx('text-sm font-semibold', styles.title)}>{title ?? (variant === 'success' ? 'Success' : 'Error')}</p>
            <p className={cx('mt-1 text-sm leading-5', styles.text)}>{message}</p>
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)]"
            aria-label="Close notification"
            onClick={onClose}
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}