import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cx } from '@/src/utils/cx'

type TextareaProps = {
  label?: string
  error?: string
  helperText?: string
  wrapperClassName?: string
  textareaClassName?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    error,
    helperText,
    wrapperClassName,
    textareaClassName,
    className,
    id,
    ...textareaProps
  },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? `${generatedId}-textarea`

  return (
    <label className={cx('grid gap-1.5', wrapperClassName)} htmlFor={textareaId}>
      {label ? <span className="text-sm font-semibold text-[var(--ui-text)]">{label}</span> : null}

      <textarea
        ref={ref}
        id={textareaId}
        className={cx(
          'rounded-lg border bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none placeholder:text-[var(--ui-muted)] transition-colors resize-none',
          error
            ? 'border-[var(--ui-danger)] focus:border-[var(--ui-danger)]'
            : 'border-[var(--ui-border)] focus:border-[var(--ui-primary)]',
          textareaClassName,
          className,
        )}
        {...textareaProps}
      />

      {error ? <span className="text-xs font-medium text-[var(--ui-danger)]">{error}</span> : null}
      {helperText ? <span className="text-xs text-[var(--ui-muted)]">{helperText}</span> : null}
    </label>
  )
})

Textarea.displayName = 'Textarea'