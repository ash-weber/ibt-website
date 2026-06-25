import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { FiX } from 'react-icons/fi'
import { cx } from '@/src/utils/cx'

type ModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  className?: string
}

const SIZE_MAP: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const lastActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    lastActiveElementRef.current = document.activeElement as HTMLElement

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables =
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    const firstFocusable = focusables?.[0]

    if (firstFocusable) {
      firstFocusable.focus()
    } else {
      panelRef.current?.focus()
    }

    return () => {
      document.body.style.overflow = originalOverflow
      lastActiveElementRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusables =
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)

      if (focusables.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeOnEsc, isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/35 cursor-pointer"
        aria-label="Close modal"
        onClick={handleOverlayClick}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx(
          'relative z-[10000] flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white shadow-[var(--ui-shadow-lg)]',
          SIZE_MAP[size],
          className
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--ui-border)] px-5 py-4">
          <h2 className="flex-1 pr-2 text-lg font-semibold text-[var(--ui-text)]">
            {title}
          </h2>
        </header>

        <button
          type="button"
          className="absolute top-4 right-5 z-[90] inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ui-border)] text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)] cursor-pointer"
          aria-label="Close"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        <section className="flex-1 overflow-auto p-6 text-[var(--ui-text)]">
          {children}
        </section>

        {footer ? (
          <footer className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[var(--ui-border)] bg-white px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}