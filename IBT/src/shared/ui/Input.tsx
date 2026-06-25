import { forwardRef, useState, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cx } from '@/src/utils/cx'

type InputProps = {
  label?: string
  error?: string
  helperText?: string
  startIcon?: ReactNode
  endIcon?: ReactNode
  wrapperClassName?: string
  inputClassName?: string
  showPasswordToggle?: boolean
} & InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    wrapperClassName,
    inputClassName,
    className,
    type = 'text',
    id,
    showPasswordToggle = true,
    ...inputProps
  },
  ref,
) {
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && revealed ? 'text' : type
  const generatedId = useId()
  const inputId = id ?? `${generatedId}-input`

  return (
    <label className={cx('grid gap-1.5', wrapperClassName)} htmlFor={inputId}>
      {label ? <span className="text-sm font-semibold text-[var(--ui-text)]">{label}</span> : null}

      <span
        className={cx(
          'group relative flex h-11 items-center rounded-lg border bg-white transition-colors',
          error
            ? 'border-[var(--ui-danger)] focus-within:border-[var(--ui-danger)]'
            : 'border-[var(--ui-border)] focus-within:border-[var(--ui-primary)]',
          className,
        )}
      >
        {startIcon ? <span className="pl-3 text-[var(--ui-muted)]">{startIcon}</span> : null}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cx(
            'h-full w-full appearance-none bg-transparent px-3 text-sm text-[var(--ui-text)] outline-none placeholder:text-[var(--ui-muted)] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
            Boolean(startIcon) && 'pl-2',
            Boolean(endIcon || (isPassword && showPasswordToggle)) && 'pr-10',
            inputClassName,
          )}
          {...inputProps}
        />

        {isPassword && showPasswordToggle ? (
          <button
            type="button"
            className="absolute right-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ui-muted)] hover:bg-[var(--ui-surface-muted)]"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            onClick={() => setRevealed((prev) => !prev)}
          >
            {revealed ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        ) : endIcon ? (
          <span className="absolute right-3 text-[var(--ui-muted)]">{endIcon}</span>
        ) : null}
      </span>

      {error ? <span className="text-xs font-medium text-[var(--ui-danger)]">{error}</span> : null}
      {helperText ? <span className="text-xs text-[var(--ui-muted)]">{helperText}</span> : null}
    </label>
  )
})

Input.displayName = 'Input'