import { useCallback, useEffect, useRef, useState } from 'react'
import { FiCheck, FiImage, FiLoader, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi'
import { uploadLabProjectImage } from '../../../api/labProjectsMaster'
import { getAbsoluteImageUrl } from '../../../utils/image'

type SpotlightImageUploadProps = {
  label?: string
  imageUrl: string
  onUrlChange: (url: string) => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export function SpotlightImageUpload({ label = 'Spotlight Image', imageUrl, onUrlChange }: SpotlightImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState(imageUrl)

  // sync external imageUrl -> local url input
  useEffect(() => {
    setUrlInputValue(imageUrl)
  }, [imageUrl])

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const displayUrl = previewUrl ?? (imageUrl ? getAbsoluteImageUrl(imageUrl) : null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Only image files are supported.')
      setUploadState('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10 MB.')
      setUploadState('error')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploadState('uploading')
    setErrorMsg('')

    try {
      const result = await uploadLabProjectImage(file)
      onUrlChange(result.absoluteUrl)
      setUploadState('done')
    } catch {
      setUploadState('error')
      setErrorMsg('Upload failed. Please try again.')
      setPreviewUrl(null)
    }
  }, [onUrlChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.currentTarget.value = ''
  }

  const handleRemove = () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setUploadState('idle')
    setErrorMsg('')
    onUrlChange('')
    setUrlInputValue('')
  }

  return (
    <div className="grid gap-2">
      {label && <span className="text-sm font-semibold text-[var(--ui-text)]">{label}</span>}

      <div
        className={[
          'relative overflow-hidden rounded-2xl border-2 transition-all duration-200',
          isDragging
            ? 'border-red-500 bg-red-50 scale-[1.01]'
            : displayUrl
            ? 'border-[var(--ui-border)] bg-white'
            : 'border-dashed border-[var(--ui-border)] bg-slate-50 hover:border-red-300 hover:bg-red-50/30',
        ].join(' ')}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {/* Preview */}
        {displayUrl ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={displayUrl}
              alt="Spotlight preview"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              onError={() => { setPreviewUrl(null) }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100">
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 backdrop-blur-sm hover:bg-white transition-all"
                >
                  <FiUploadCloud size={13} /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-red-600 transition-all"
                >
                  <FiTrash2 size={13} /> Remove
                </button>
              </div>
            </div>

            {/* Upload status badge */}
            {uploadState === 'uploading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 text-white">
                  <FiLoader size={28} className="animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Uploading…</span>
                </div>
              </div>
            )}
            {uploadState === 'done' && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                <FiCheck size={10} strokeWidth={3} /> Uploaded
              </div>
            )}
          </div>
        ) : (
          /* Drop zone */
          <button
            type="button"
            className="flex w-full flex-col items-center gap-4 py-10 text-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className={['flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200', isDragging ? 'bg-red-500 text-white scale-110' : 'bg-slate-100 text-slate-400'].join(' ')}>
              <FiUploadCloud size={26} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {isDragging ? 'Drop to upload' : 'Drag & drop image here'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                or <span className="font-semibold text-red-600 underline underline-offset-2">click to browse</span> · PNG, JPG, WEBP up to 10 MB
              </p>
            </div>
          </button>
        )}

        {/* Error */}
        {uploadState === 'error' && (
          <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-4 py-2.5">
            <FiX size={14} className="shrink-0 text-red-600" />
            <p className="text-xs font-semibold text-red-700">{errorMsg}</p>
            <button
              type="button"
              className="ml-auto text-xs text-red-600 underline"
              onClick={() => setUploadState('idle')}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Bottom toolbar */}
        {uploadState !== 'uploading' && (
          <div className="flex items-center gap-2 border-t border-[var(--ui-border)] bg-white/80 px-3 py-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <FiUploadCloud size={12} />
              {displayUrl ? 'Replace Image' : 'Upload Image'}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setShowUrlInput((v) => !v)}
            >
              <FiImage size={12} />
              Paste URL
            </button>

            {displayUrl && (
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleRemove}
              >
                <FiTrash2 size={12} /> Remove
              </button>
            )}
          </div>
        )}

        {/* URL input drawer */}
        {showUrlInput && (
          <div className="border-t border-[var(--ui-border)] bg-slate-50 px-3 py-2.5 flex gap-2">
            <input
              type="url"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-red-400"
              placeholder="https://example.com/image.jpg"
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUrlChange(urlInputValue)
                  setShowUrlInput(false)
                }
              }}
            />
            <button
              type="button"
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
              onClick={() => {
                onUrlChange(urlInputValue)
                setShowUrlInput(false)
              }}
            >
              Apply
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
              onClick={() => { setShowUrlInput(false); setUrlInputValue(imageUrl) }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
