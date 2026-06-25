import type { LoaderSize } from '@/src/types/ui'
import { cx } from '@/src/utils/cx'

type LoaderProps = {
  size?: LoaderSize
  label?: string
  fullscreen?: boolean
  className?: string
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 24,
  lg: 32,
}

function normalizeSize(size: LoaderSize): number {
  if (typeof size === 'number') {
    return Math.max(10, size)
  }

  return SIZE_MAP[size]
}

export function Loader({ size = 'md', label = 'Loading', fullscreen = false, className }: LoaderProps) {
  const pixelSize = normalizeSize(size)
  const borderSize = Math.max(2, Math.round(pixelSize / 8))

  const spinner = (
    <span
      className={cx('inline-block animate-spin rounded-full border-solid border-[var(--ui-border)] border-t-[var(--ui-primary)]', className)}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        borderWidth: `${borderSize}px`,
      }}
      role="status"
      aria-label={label}
    />
  )

  if (!fullscreen) {
    return spinner
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-white/70 backdrop-blur-[1px]" role="status" aria-live="polite" aria-label={label}>
      <div className="flex items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-white px-4 py-3 text-sm text-[var(--ui-muted)] shadow-[var(--ui-shadow-md)]">
        {spinner}
        <span>{label}</span>
      </div>
    </div>
  )
}