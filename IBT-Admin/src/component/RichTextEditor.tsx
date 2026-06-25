import { useMemo } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { cx } from '../utils/cx'

type RichTextEditorProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  name?: string
  placeholder?: string
  helperText?: string
  error?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  showPreview?: boolean // kept for backward compatibility if any form spreads it, but unused
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write your content...',
  helperText,
  error,
  minHeight = 220,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        // Heading and Font Styles
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],

        // Text Styles
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],

        // Lists and Alignment
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],

        // Inserts
        ['link', 'blockquote', 'code-block'],

        // Clear formatting
        ['clean'],
      ],
    }),
    [],
  )

  return (
    <div className={cx('grid gap-1.5', className)}>
      {label ? <span className="text-sm font-semibold text-[var(--ui-text)]">{label}</span> : null}

      <div
        className={cx(
          'rounded-lg border bg-white overflow-hidden',
          error ? 'border-[var(--ui-danger)]' : 'border-[var(--ui-border)]',
          disabled && 'opacity-70 pointer-events-none'
        )}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          readOnly={disabled}
          className="qb-editor-wrapper"
          style={{ minHeight: `${minHeight}px` }}
        />
      </div>

      <style>{`
        .qb-editor-wrapper .ql-container {
          font-family: inherit;
          font-size: 0.875rem;
          min-height: ${minHeight}px;
          border: none !important;
        }
        .qb-editor-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid var(--ui-border) !important;
          background-color: var(--ui-surface);
        }
        .qb-editor-wrapper .ql-editor {
          min-height: ${minHeight}px;
          color: var(--ui-text);
        }
        .qb-editor-wrapper .ql-editor p {
          margin-bottom: 0.75rem;
        }
      `}</style>

      {error ? <span className="text-xs font-medium text-[var(--ui-danger)]">{error}</span> : null}
      {!error && helperText ? <span className="text-xs text-[var(--ui-muted)]">{helperText}</span> : null}
    </div>
  )
}
