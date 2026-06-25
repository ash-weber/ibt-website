import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'
import { cx } from '../utils/cx'

export type DropdownOption = {
  label: string
  value: string
  icon?: ReactNode
}

type DropdownProps = {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  className,
  disabled = false,
  showSearch = false,
  searchPlaceholder = 'Search...',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div ref={containerRef} className={cx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[var(--ui-border)] bg-white px-3 text-sm text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon ? <span className="text-[var(--ui-muted)]">{selectedOption.icon}</span> : null}
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        </span>
        <FiChevronDown className={cx('text-[var(--ui-muted)] transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-full min-w-44 overflow-hidden rounded-xl border border-[var(--ui-border)] bg-white shadow-[var(--ui-shadow-md)] flex flex-col"
          role="listbox"
        >
          {showSearch ? (
            <div className="border-b border-[var(--ui-border)] p-2">
              <input
                type="text"
                className="w-full rounded-md border border-[var(--ui-border)] bg-white px-2.5 py-1.5 text-xs text-[var(--ui-text)] outline-none focus:border-[var(--ui-primary)]"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : null}

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cx(
                      'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary-strong)]'
                        : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]',
                    )}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon ? <span>{option.icon}</span> : null}
                      <span>{option.label}</span>
                    </span>
                    {isSelected ? <FiCheck size={16} /> : null}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-3 text-xs text-[var(--ui-muted)] text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
