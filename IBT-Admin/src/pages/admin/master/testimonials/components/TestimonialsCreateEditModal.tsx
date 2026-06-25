import { useEffect, useState } from 'react'
import { ActionButton, Input, Modal } from '../../../../../component'
import { ImageUploadField } from '../../../components/ImageUploadField'

type Mode = 'create' | 'edit'

export type TestimonialsCreateEditFormValues = {
  name: string
  content: string
  role: string
  company: string
  avatarUrl: string
}

type FormErrors = {
  name?: string
  content?: string
  role?: string
  company?: string
}

type TestimonialsCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: TestimonialsCreateEditFormValues
  submitting?: boolean
  uploadLoading?: boolean
  onClose: () => void
  onSubmit: (values: TestimonialsCreateEditFormValues, selectedAvatarFile: File | null) => void | Promise<void>
}

function validate(values: TestimonialsCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const name = values.name.trim()
  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length > 120) {
    errors.name = 'Name must be at most 120 characters long.'
  }

  const content = values.content.trim()
  if (!content) {
    errors.content = 'Content is required.'
  } else if (content.length > 3000) {
    errors.content = 'Content must be at most 3000 characters long.'
  }

  const role = values.role.trim()
  if (role.length > 120) {
    errors.role = 'Role must be at most 120 characters long.'
  }

  const company = values.company.trim()
  if (company.length > 120) {
    errors.company = 'Company must be at most 120 characters long.'
  }

  return errors
}

export function TestimonialsCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  uploadLoading = false,
  onClose,
  onSubmit,
}: TestimonialsCreateEditModalProps) {
  const [values, setValues] = useState<TestimonialsCreateEditFormValues>(initialValues)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const isBusy = submitting || uploadLoading

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setSelectedAvatarFile(null)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof TestimonialsCreateEditFormValues, value: string) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }))
  }

  const contentErrorClass = errors.content
    ? 'w-full resize-y rounded-lg border border-[var(--ui-danger)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-muted)] focus:border-[var(--ui-danger)]'
    : 'w-full resize-y rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-muted)] focus:border-[var(--ui-primary)]'

  const handleSubmit = () => {
    const nextErrors = validate(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onSubmit(values, selectedAvatarFile)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Testimonial' : 'Edit Testimonial'}
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
          label="Name"
          placeholder="Jane Doe"
          value={values.name}
          onChange={(event) => setFieldValue('name', event.target.value)}
          error={errors.name}
          helperText="Required, max 120 characters"
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Content</span>
          <textarea
            value={values.content}
            rows={5}
            placeholder="Client testimonial content"
            onChange={(event) => setFieldValue('content', event.target.value)}
            className={contentErrorClass}
          />
          {errors.content ? <span className="text-xs font-medium text-[var(--ui-danger)]">{errors.content}</span> : <span className="text-xs text-[var(--ui-muted)]">Required, max 3000 characters</span>}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Role"
            placeholder="CTO"
            value={values.role}
            onChange={(event) => setFieldValue('role', event.target.value)}
            error={errors.role}
            helperText="Optional, max 120 characters"
          />

          <Input
            label="Company"
            placeholder="Acme Inc"
            value={values.company}
            onChange={(event) => setFieldValue('company', event.target.value)}
            error={errors.company}
            helperText="Optional, max 120 characters"
          />
        </div>

        <ImageUploadField
          label="Avatar Image"
          selectedFile={selectedAvatarFile}
          existingImageUrl={values.avatarUrl}
          previewAlt="Testimonial avatar preview"
          helperText="Optional. Upload a profile image for this testimonial."
          onRemove={() => {
            setSelectedAvatarFile(null)
            setFieldValue('avatarUrl', '')
          }}
          onFileChange={setSelectedAvatarFile}
        />
      </div>
    </Modal>
  )
}
