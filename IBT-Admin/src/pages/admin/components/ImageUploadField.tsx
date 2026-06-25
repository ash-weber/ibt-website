import { useEffect, useMemo, useRef, useState } from 'react'
import { FiImage, FiTrash2, FiUpload } from 'react-icons/fi'
import { getAbsoluteImageUrl } from '../../../utils/image'

type ImageUploadFieldProps = {
  label: string
  selectedFile: File | null
  existingImageUrl?: string
  previewAlt: string
  helperText?: string
  emptyText?: string
  onRemove?: () => void
  onFileChange: (file: File | null) => void
}

export function ImageUploadField({
  label,
  selectedFile,
  existingImageUrl,
  previewAlt,
  helperText,
  emptyText = 'Choose an image file or drag it here',
  onRemove,
  onFileChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const selectedImageUrl = useMemo(() => {
    if (!selectedFile) {
      return null
    }

    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl)
      }
    }
  }, [selectedImageUrl])

  const previewUrl = selectedImageUrl ?? (existingImageUrl ? getAbsoluteImageUrl(existingImageUrl) : null)

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  const handleRemove = () => {
    onFileChange(null)
    onRemove?.()
  }

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0] ?? null
    if (file && file.type.startsWith('image/')) {
      onFileChange(file)
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--ui-text)]">{label}</span>

      <div className={`overflow-hidden rounded-xl border transition-all ${isDragging ? 'border-[var(--ui-primary)] ring-2 ring-[var(--ui-primary)]/20 bg-blue-50/10' : 'border-[var(--ui-border)] bg-white'}`}>
        <button
          type="button"
          className={`relative block h-52 w-full overflow-hidden text-left transition-colors ${isDragging ? 'bg-[var(--ui-primary)]/5' : 'bg-[var(--ui-surface-muted)]'}`}
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            /* CHANGED: object-cover to object-contain, added p-2 for breathing room */
            <img src={previewUrl} alt={previewAlt} className="h-full w-full object-contain p-2 max-w-md mx-auto pointer-events-none" />
          ) : (
            <div className="grid h-full place-items-center text-[var(--ui-muted)] pointer-events-none">
              <div className="flex flex-col items-center gap-2 text-sm">
                <FiImage size={20} className={isDragging ? 'text-[var(--ui-primary)] scale-110 transition-transform' : ''} />
                <span className={isDragging ? 'text-[var(--ui-primary)] font-medium' : ''}>{isDragging ? 'Drop image here' : emptyText}</span>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 py-2 text-xs text-white">
            <span className="font-semibold uppercase tracking-wide">
              {selectedFile ? 'New Preview' : previewUrl ? 'Current Image' : 'No Image'}
            </span>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null
            onFileChange(file)
          }}
        />

        <div className="flex items-center justify-between gap-2 border-t border-[var(--ui-border)] px-3 py-2">
          <p className="truncate text-xs text-[var(--ui-muted)]">
            {selectedFile ? selectedFile.name : previewUrl ? 'Using saved image' : 'No image selected'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--ui-border)] px-2.5 text-xs font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]"
              onClick={openFilePicker}
            >
              <FiUpload size={12} />
              {previewUrl ? 'Replace' : 'Upload'}
            </button>

            {previewUrl ? (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2.5 text-xs font-medium text-red-700 hover:bg-red-50"
                onClick={handleRemove}
              >
                <FiTrash2 size={12} />
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {helperText ? <p className="text-xs text-[var(--ui-muted)]">{helperText}</p> : null}
    </div>
  )
}