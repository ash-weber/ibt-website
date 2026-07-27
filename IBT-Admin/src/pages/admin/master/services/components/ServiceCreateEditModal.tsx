import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionButton, Input, Modal } from '../../../../../component'
import { ImageUploadField } from '../../../components/ImageUploadField'

type Mode = 'create' | 'edit'

export type ServiceCreateEditFormValues = {
  title: string
  slug: string
  description: string
  tags: string
  imageUrl: string
  projectUrl: string
  categoryType: 'SERVICE' | 'PRODUCT'
  isFeatured: boolean
}

type FormErrors = {
  title?: string
  slug?: string
  description?: string
  imageUrl?: string
  projectUrl?: string
}

type ServiceCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: ServiceCreateEditFormValues
  submitting?: boolean
  uploadLoading?: boolean
  onClose: () => void
  onSubmit: (values: ServiceCreateEditFormValues, selectedImageFile: File | null) => void | Promise<void>
}

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function validate(values: ServiceCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Title is required.'
  }

  return errors
}

export function ServiceCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  uploadLoading = false,
  onClose,
  onSubmit,
}: ServiceCreateEditModalProps) {
  const [values, setValues] = useState<ServiceCreateEditFormValues>(initialValues)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const isBusy = submitting || uploadLoading

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setSelectedImageFile(null)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = <K extends keyof ServiceCreateEditFormValues>(key: K, value: ServiceCreateEditFormValues[K]) => {
    setValues((previous) => {
      const next = { ...previous, [key]: value }

      // Auto-generate slug when title changes
      if (key === 'title' && typeof value === 'string') {
        const autoSlug = slugify(value)
        if (mode === 'create' || !previous.slug || previous.slug === slugify(previous.title)) {
          next.slug = autoSlug
        }
      }

      return next
    })

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }))
  }

  const descriptionErrorClass = useMemo(
    () =>
      errors.description
        ? 'w-full resize-y rounded-lg border border-[var(--ui-danger)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-muted)] focus:border-[var(--ui-danger)]'
        : 'w-full resize-y rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-muted)] focus:border-[var(--ui-primary)]',
    [errors.description],
  )

  const handleSubmit = () => {
    const finalTitle = values.title.trim()
    const finalSlug = values.slug.trim() || slugify(finalTitle) || 'item-' + Date.now()
    const finalDesc = values.description.trim() || `${finalTitle} - ${values.categoryType === 'PRODUCT' ? 'Product' : 'Service'} built by I-BACUS TECH.`
    const finalImage = values.imageUrl.trim() || (selectedImageFile ? '' : DEFAULT_IMAGE_URL)

    const finalValues: ServiceCreateEditFormValues = {
      ...values,
      title: finalTitle,
      slug: finalSlug,
      description: finalDesc,
      imageUrl: finalImage,
    }

    const nextErrors = validate(finalValues)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setErrors({})
    onSubmit(finalValues, selectedImageFile)
  }

  const errorList = Object.values(errors).filter(Boolean)

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Item' : 'Edit Item'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <ActionButton intent="cancel" onClick={onClose} disabled={isBusy}>
            Cancel
          </ActionButton>
          <ActionButton intent="save" loading={isBusy} onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </ActionButton>
        </>
      }
    >
      <div ref={containerRef} className="grid gap-4">
        {/* Top Validation Summary if errors exist */}
        {errorList.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p className="font-bold">Please fill in required fields:</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              {errorList.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Category Type Selection */}
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Category Type</span>
          <select
            value={values.categoryType}
            onChange={(e) => setFieldValue('categoryType', e.target.value as 'SERVICE' | 'PRODUCT')}
            className="w-full rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2 text-sm text-[var(--ui-text)] outline-none transition-colors focus:border-[var(--ui-primary)]"
          >
            <option value="SERVICE">Service (Appears on Services page)</option>
            <option value="PRODUCT">Product / Project (Appears on Products page)</option>
          </select>
        </label>

        {/* Conditional Featured Project Field if Product */}
        {values.categoryType === 'PRODUCT' && (
          <label className="grid gap-1.5 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
            <span className="text-sm font-semibold text-[var(--ui-text)]">Featured Project on Products Page?</span>
            <select
              value={values.isFeatured ? 'YES' : 'NO'}
              onChange={(e) => setFieldValue('isFeatured', e.target.value === 'YES')}
              className="w-full rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2 text-sm text-[var(--ui-text)] outline-none transition-colors focus:border-[var(--ui-primary)]"
            >
              <option value="NO">No (Appears under All Projects grid)</option>
              <option value="YES">Yes (Appears in Featured Projects showcase at the top)</option>
            </select>
          </label>
        )}

        <Input
          label="Title *"
          placeholder={values.categoryType === 'PRODUCT' ? 'e.g. AI Interview System' : 'e.g. Cloud Migration'}
          value={values.title}
          onChange={(event) => setFieldValue('title', event.target.value)}
          error={errors.title}
        />

        <Input
          label="Slug"
          placeholder={values.categoryType === 'PRODUCT' ? 'ai-interview-system' : 'cloud-migration'}
          value={values.slug}
          onChange={(event) => setFieldValue('slug', event.target.value)}
          error={errors.slug}
          helperText="Auto-generated from title."
        />

        <Input
          label="External Link / Project URL (Optional)"
          placeholder="https://example.com"
          value={values.projectUrl}
          onChange={(event) => setFieldValue('projectUrl', event.target.value)}
          error={errors.projectUrl}
          helperText="If provided, this link will be displayed on the product details page."
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Description (Optional)</span>
          <textarea
            value={values.description}
            rows={4}
            placeholder={values.categoryType === 'PRODUCT' ? 'Product / Project description...' : 'Service description...'}
            onChange={(event) => setFieldValue('description', event.target.value)}
            className={descriptionErrorClass}
          />
        </label>

        <div>
          <ImageUploadField
            label="Image (Optional)"
            selectedFile={selectedImageFile}
            existingImageUrl={values.imageUrl}
            previewAlt="Preview"
            helperText="Upload image or leave empty for default card image."
            onRemove={() => {
              setSelectedImageFile(null)
              setValues((previous) => ({
                ...previous,
                imageUrl: '',
              }))
            }}
            onFileChange={(file) => {
              setSelectedImageFile(file)
            }}
          />
        </div>

        <Input
          label="Tags"
          placeholder="React, Node.js, MongoDB, AI"
          value={values.tags}
          onChange={(event) => setFieldValue('tags', event.target.value)}
          helperText="Comma separated tech tags (e.g. React, Python, AI)"
        />
      </div>
    </Modal>
  )
}