import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { FiEdit2, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import type { ActionIntent, ComponentSize } from '@/src/types/ui'
import { cx } from '@/src/utils/cx'
import { Loader } from './Loader'

type ActionButtonProps = {
  intent?: ActionIntent
  size?: ComponentSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  confirmDestructive?: boolean
  confirmMessage?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const BASE = 'cursor-pointer inline-flex items-center justify-center gap-2 rounded-[var(--ui-radius-md)] border font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ui-primary)] disabled:cursor-not-allowed disabled:opacity-60'

const SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

const INTENT_MAP: Record<ActionIntent, string> = {
  save: 'border-transparent bg-[var(--ui-primary)] text-white hover:bg-[var(--ui-primary-strong)]',
  update: 'border-transparent bg-[var(--ui-primary-soft)] text-[var(--ui-primary-strong)] hover:bg-[var(--ui-primary-softer)]',
  delete: 'border-transparent bg-[var(--ui-danger)] text-white hover:bg-[var(--ui-danger-strong)]',
  cancel: 'border-[var(--ui-border-strong)] bg-white text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]',
  primary: 'border-transparent bg-[var(--ui-primary)] text-white hover:bg-[var(--ui-primary-strong)]',
  secondary: 'border-transparent bg-[var(--ui-neutral)] text-white hover:bg-[var(--ui-neutral-strong)]',
  ghost: 'border-[var(--ui-border)] bg-transparent text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]',
}

const DEFAULT_LEFT_ICON_MAP: Partial<Record<ActionIntent, ReactNode>> = {
  save: <FiSave />,
  update: <FiEdit2 />,
  delete: <FiTrash2 />,
  cancel: <FiX />,
}

function isDestructive(intent: ActionIntent, confirmDestructive?: boolean) {
  if (typeof confirmDestructive === 'boolean') {
    return confirmDestructive
  }

  return intent === 'delete'
}

export function ActionButton({
  intent = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  confirmDestructive,
  confirmMessage = 'Are you sure you want to continue?',
  className,
  children,
  onClick,
  disabled,
  ...rest
}: ActionButtonProps) {
  const resolvedLeftIcon = leftIcon ?? DEFAULT_LEFT_ICON_MAP[intent]

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault()
      return
    }

    if (isDestructive(intent, confirmDestructive) && !window.confirm(confirmMessage)) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }

  return (
    <button
      className={cx(
        BASE,
        SIZE_MAP[size],
        INTENT_MAP[intent],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {loading ? <Loader size="sm" /> : resolvedLeftIcon}
      {children}
      {rightIcon}
    </button>
  )
}