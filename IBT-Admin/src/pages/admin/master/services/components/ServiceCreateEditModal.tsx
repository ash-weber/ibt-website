import { useEffect, useMemo, useState } from 'react'
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

function validate(values: ServiceCreateEditFormValues, selectedImageFile: File | null): FormErrors {
  const errors: FormErrors = {}
  const effectiveImageValue = selectedImageFile ? selectedImageFile.name : values.imageUrl

  if (!values.title.trim()) {
    errors.title = 'Title is required.'
  }

  if (!values.slug.trim()) {
    errors.slug = 'Slug is required.'
  }

  if (!values.description.trim()) {
    errors.description = 'Description is required.'
  }

  if (!effectiveImageValue.trim()) {
    errors.imageUrl = 'Service image is required.'
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

  const isBusy = submitting || uploadLoading

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setSelectedImageFile(null)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof ServiceCreateEditFormValues, value: string) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }))

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
    const nextErrors = validate(values, selectedImageFile)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onSubmit(values, selectedImageFile)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Service' : 'Edit Service'}
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
      <div className="grid gap-4">
        <Input
          label="Title"
          placeholder="Cloud Migration"
          value={values.title}
          onChange={(event) => setFieldValue('title', event.target.value)}
          error={errors.title}
        />

        <Input
          label="Slug"
          placeholder="cloud-migration"
          value={values.slug}
          onChange={(event) => setFieldValue('slug', event.target.value)}
          error={errors.slug}
        />

        <Input
          label="External Link (Optional)"
          placeholder="https://example.com"
          value={values.projectUrl}
          onChange={(event) => setFieldValue('projectUrl', event.target.value)}
          error={errors.projectUrl}
          helperText="If provided, clicking the service will navigate here."
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Description</span>
          <textarea
            value={values.description}
            rows={5}
            placeholder="Service description"
            onChange={(event) => setFieldValue('description', event.target.value)}
            className={descriptionErrorClass}
          />
          {errors.description ? <span className="text-xs font-medium text-[var(--ui-danger)]">{errors.description}</span> : null}
        </label>

        <div>
          <ImageUploadField
            label="Service Image"
            selectedFile={selectedImageFile}
            existingImageUrl={values.imageUrl}
            previewAlt="Service preview"
            helperText="Image is uploaded as file. New services are created at the end. Use Reorder Services for sorting."
            onRemove={() => {
              setSelectedImageFile(null)
              setValues((previous) => ({
                ...previous,
                imageUrl: '',
              }))
              setErrors((previous) => ({
                ...previous,
                imageUrl: 'Service image is required.',
              }))
            }}
            onFileChange={(file) => {
              setSelectedImageFile(file)

              if (file) {
                setErrors((previous) => ({
                  ...previous,
                  imageUrl: undefined,
                }))
              }
            }}
          />
          {errors.imageUrl ? <p className="mt-1 text-xs font-medium text-[var(--ui-danger)]">{errors.imageUrl}</p> : null}
        </div>

        <Input
          label="Tags"
          placeholder="cloud, migration, strategy"
          value={values.tags}
          onChange={(event) => setFieldValue('tags', event.target.value)}
          helperText="Comma separated values"
        />
      </div>
    </Modal>
  )
}