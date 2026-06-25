import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '@/src/utils/cx'

type CheckboxProps = {
  label?: string
  error?: string
  wrapperClassName?: string
} & InputHTMLAttributes<HTMLInputElement>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, wrapperClassName, className, id, ...inputProps },
  ref,
) {
  const generatedId = useId()
  const checkboxId = id ?? `${generatedId}-checkbox`

  return (
    <div className={cx('flex flex-col gap-1.5', wrapperClassName)}>
      <label className="flex items-center gap-2 cursor-pointer" htmlFor={checkboxId}>
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cx(
            'h-5 w-5 rounded border-[var(--ui-border)] cursor-pointer accent-[var(--ui-primary)] transition-colors',
            error ? 'border-[var(--ui-danger)]' : 'border-[var(--ui-border)]',
            className,
          )}
          {...inputProps}
        />
        {label && <span className="text-sm text-[var(--ui-text)]">{label}</span>}
      </label>
      {error ? <span className="text-xs font-medium text-[var(--ui-danger)]">{error}</span> : null}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'