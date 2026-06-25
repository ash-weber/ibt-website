import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionButton, Dropdown, Input, Modal } from '../../../../../component'
import { FiImage, FiTrash2, FiUpload } from 'react-icons/fi'
import { ImageUploadField } from '../../../components/ImageUploadField'
import type { LabProjectStatus } from '../../../../../types/labProjectsMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

type Mode = 'create' | 'edit'

export type LabProjectsCreateEditFormValues = {
  title: string
  slug: string
  description: string
  content: string
  imageUrl: string
  gallery: string[]
  tags: string
  techStack: string
  projectUrl: string
  repoUrl: string
  status: LabProjectStatus
  featured: boolean
}

type FormErrors = {
  title?: string
  slug?: string
  description?: string
}

type LabProjectsCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: LabProjectsCreateEditFormValues
  submitting?: boolean
  uploadLoading?: boolean
  onClose: () => void
  onSubmit: (
    values: LabProjectsCreateEditFormValues,
    selectedImageFile: File | null,
    selectedGalleryFiles: File[]
  ) => void | Promise<void>
}

type GalleryUploadFieldProps = {
  existingImages: string[]
  selectedFiles: File[]
  helperText?: string
  onAddFiles: (files: File[]) => void
  onRemoveExisting: (index: number) => void
  onRemoveSelected: (index: number) => void
}

const STATUS_FORM_OPTIONS = [
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
]

const FEATURED_FORM_OPTIONS = [
  { label: 'No', value: 'false' },
  { label: 'Yes', value: 'true' },
]

function GalleryUploadField({
  existingImages,
  selectedFiles,
  helperText,
  onAddFiles,
  onRemoveExisting,
  onRemoveSelected,
}: GalleryUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  )

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [selectedPreviews])

  const allImages = [
    ...existingImages.map((url, index) => ({
      id: `existing-${index}`,
      kind: 'existing' as const,
      src: getAbsoluteImageUrl(url),
      label: `Saved image ${index + 1}`,
      onRemove: () => onRemoveExisting(index),
    })),
    ...selectedPreviews.map((preview, index) => ({
      id: `selected-${index}`,
      kind: 'selected' as const,
      src: preview.url,
      label: preview.name,
      onRemove: () => onRemoveSelected(index),
    })),
  ]

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--ui-text)]">Gallery Images</span>

      <div className="overflow-hidden rounded-xl border border-[var(--ui-border)] bg-white">
        <button
          type="button"
          className="grid w-full place-items-center bg-[var(--ui-surface-muted)] px-4 py-8 text-center text-[var(--ui-muted)]"
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-sm">
            <FiImage size={20} />
            <span className="font-medium text-[var(--ui-text)]">Upload gallery images</span>
            <span>Select one or more image files</span>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length > 0) {
              onAddFiles(files)
            }
            event.currentTarget.value = ''
          }}
        />

        <div className="flex items-center justify-between gap-2 border-t border-[var(--ui-border)] px-3 py-2">
          <p className="truncate text-xs text-[var(--ui-muted)]">
            {allImages.length > 0 ? `${allImages.length} image${allImages.length === 1 ? '' : 's'} selected` : 'No gallery images selected'}
          </p>

          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--ui-border)] px-2.5 text-xs font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]"
            onClick={() => inputRef.current?.click()}
          >
            <FiUpload size={12} />
            Add Images
          </button>
        </div>
      </div>

      {allImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {allImages.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border border-[var(--ui-border)] bg-white">
              <img src={image.src} alt={image.label} className="h-28 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent px-2 py-1.5 text-[10px] text-white">
                <span className="truncate pr-2">{image.kind === 'existing' ? 'Saved image' : 'New image'}</span>
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded bg-black/35 hover:bg-black/55"
                  onClick={image.onRemove}
                  aria-label="Remove image"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {helperText ? <p className="text-xs text-[var(--ui-muted)]">{helperText}</p> : null}
    </div>
  )
}

function validate(values: LabProjectsCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const title = values.title.trim()
  if (!title) {
    errors.title = 'Title is required.'
  }

  const slug = values.slug.trim()
  if (!slug) {
    errors.slug = 'Slug is required.'
  }

  const description = values.description.trim()
  if (!description) {
    errors.description = 'Description is required.'
  }

  return errors
}

export function LabProjectsCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  uploadLoading = false,
  onClose,
  onSubmit,
}: LabProjectsCreateEditModalProps) {
  const [values, setValues] = useState<LabProjectsCreateEditFormValues>(initialValues)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<FormErrors>({})

  const isBusy = submitting || uploadLoading

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setSelectedImageFile(null)
    setSelectedGalleryFiles([])
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof LabProjectsCreateEditFormValues, value: string | boolean) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }))

    if (key === 'title' || key === 'slug' || key === 'description') {
      setErrors((previous) => ({
        ...previous,
        [key]: undefined,
      }))
    }
  }

  const handleSubmit = () => {
    const nextErrors = validate(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onSubmit(values, selectedImageFile, selectedGalleryFiles)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Lab Project' : 'Edit Lab Project'}
      onClose={onClose}
      size="xl"
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
      <div className="grid gap-4">
        <Input
          label="Title"
          placeholder="AI Document Intelligence"
          value={values.title}
          onChange={(event) => setFieldValue('title', event.target.value)}
          error={errors.title}
          helperText="Required"
        />

        <Input
          label="Slug"
          placeholder="ai-document-intelligence"
          value={values.slug}
          onChange={(event) => setFieldValue('slug', event.target.value)}
          error={errors.slug}
          helperText="Required. Use lowercase letters, numbers, and hyphens"
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Description</span>
          <textarea
            value={values.description}
            rows={4}
            placeholder="Short summary of this project"
            onChange={(event) => setFieldValue('description', event.target.value)}
            className="w-full resize-y rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-muted)] focus:border-[var(--ui-primary)]"
          />
          {errors.description && <span className="text-xs text-[var(--ui-danger)]">{errors.description}</span>}
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Content</span>
          <textarea
            value={values.content}
            rows={7}
            placeholder="Long-form project details (optional)"
            onChange={(event) => setFieldValue('content', event.target.value)}
            className="w-full resize-y rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-muted)] focus:border-[var(--ui-primary)]"
          />
        </label>

        <ImageUploadField
          label="Cover Image"
          selectedFile={selectedImageFile}
          existingImageUrl={values.imageUrl}
          previewAlt="Lab project cover preview"
          helperText="Optional, but recommended for better card previews"
          onRemove={() => {
            setSelectedImageFile(null)
            setFieldValue('imageUrl', '')
          }}
          onFileChange={setSelectedImageFile}
        />

        <GalleryUploadField
          existingImages={values.gallery}
          selectedFiles={selectedGalleryFiles}
          helperText="Images are uploaded and stored just like other content sections"
          onAddFiles={(files) => {
            setSelectedGalleryFiles((previous) => [...previous, ...files])
          }}
          onRemoveExisting={(index) => {
            setValues((previous) => ({
              ...previous,
              gallery: previous.gallery.filter((_, galleryIndex) => galleryIndex !== index),
            }))
          }}
          onRemoveSelected={(index) => {
            setSelectedGalleryFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))
          }}
        />

        <Input
          label="Tags"
          placeholder="ai, automation, documents"
          value={values.tags}
          onChange={(event) => setFieldValue('tags', event.target.value)}
          helperText="Comma separated tags"
        />

        <Input
          label="Tech Stack"
          placeholder="react, node.js, python"
          value={values.techStack}
          onChange={(event) => setFieldValue('techStack', event.target.value)}
          helperText="Comma separated technologies"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <span className="text-sm font-semibold text-[var(--ui-text)]">Status</span>
            <Dropdown
              options={STATUS_FORM_OPTIONS}
              value={values.status}
              onChange={(value) => setFieldValue('status', value as LabProjectStatus)}
            />
          </div>

          <div className="grid gap-1.5">
            <span className="text-sm font-semibold text-[var(--ui-text)]">Featured</span>
            <Dropdown
              options={FEATURED_FORM_OPTIONS}
              value={values.featured ? 'true' : 'false'}
              onChange={(value) => setFieldValue('featured', value === 'true')}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Project URL"
            placeholder="https://example.com/project"
            value={values.projectUrl}
            onChange={(event) => setFieldValue('projectUrl', event.target.value)}
          />
          <Input
            label="Repository URL"
            placeholder="https://github.com/org/repo"
            value={values.repoUrl}
            onChange={(event) => setFieldValue('repoUrl', event.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
