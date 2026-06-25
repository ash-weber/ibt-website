import { useEffect, useState } from 'react'
import { ActionButton, Input, Modal } from '../../../../../component'
import { ImageUploadField } from '../../../components/ImageUploadField'

type Mode = 'create' | 'edit'

export type CollegesCreateEditFormValues = {
  name: string
  website: string
  logoUrl: string
}

type FormErrors = {
  name?: string
  website?: string
}

type CollegesCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: CollegesCreateEditFormValues
  submitting?: boolean
  uploadLoading?: boolean
  onClose: () => void
  onSubmit: (values: CollegesCreateEditFormValues, selectedLogoFile: File | null) => void | Promise<void>
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validate(values: CollegesCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const name = values.name.trim()
  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length > 120) {
    errors.name = 'Name must be at most 120 characters long.'
  }

  const website = values.website.trim()
  if (website && !isValidUrl(website)) {
    errors.website = 'Website must be a valid URL (http:// or https://).'
  } else if (website && website.length > 255) {
    errors.website = 'Website must be at most 255 characters long.'
  }

  return errors
}

export function CollegesCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  uploadLoading = false,
  onClose,
  onSubmit,
}: CollegesCreateEditModalProps) {
  const [values, setValues] = useState<CollegesCreateEditFormValues>(initialValues)
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const isBusy = submitting || uploadLoading

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setSelectedLogoFile(null)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof CollegesCreateEditFormValues, value: string) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }))
  }

  const handleSubmit = () => {
    const nextErrors = validate(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onSubmit(values, selectedLogoFile)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Partner College' : 'Edit Partner College'}
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
          placeholder="Harvard University"
          value={values.name}
          onChange={(event) => setFieldValue('name', event.target.value)}
          error={errors.name}
          helperText="Required, max 120 characters"
        />

        <Input
          label="Website"
          placeholder="https://harvard.edu"
          value={values.website}
          onChange={(event) => setFieldValue('website', event.target.value)}
          error={errors.website}
          helperText="Optional. Must be a valid URL (http:// or https://)"
        />

        <ImageUploadField
          label="Logo"
          selectedFile={selectedLogoFile}
          existingImageUrl={values.logoUrl}
          previewAlt="College logo preview"
          helperText="Required. Upload the college logo."
          onRemove={() => {
            setSelectedLogoFile(null)
            setFieldValue('logoUrl', '')
          }}
          onFileChange={setSelectedLogoFile}
        />
      </div>
    </Modal>
  )
}
