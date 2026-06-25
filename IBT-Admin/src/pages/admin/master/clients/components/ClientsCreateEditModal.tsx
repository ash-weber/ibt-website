import { useEffect, useState } from 'react'
import { ActionButton, Input, Modal } from '../../../../../component'
import { ImageUploadField } from '../../../components/ImageUploadField'

type Mode = 'create' | 'edit'

export type ClientsCreateEditFormValues = {
  name: string
  logoUrl: string
  website?: string
}

type FormErrors = {
  name?: string
  logo?: string
  website?: string
}

type ClientsCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: ClientsCreateEditFormValues
  submitting?: boolean
  uploadLoading?: boolean
  onClose: () => void
  onSubmit: (values: ClientsCreateEditFormValues, selectedLogoFile: File | null) => void | Promise<void>
}

function validate(values: ClientsCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const name = values.name.trim()
  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length > 150) {
    errors.name = 'Name must be at most 150 characters long.'
  }

  const website = values.website?.trim()
  if (website) {
    try {
      new URL(website)
    } catch {
      errors.website = 'Must be a valid URL (e.g., https://example.com).'
    }
  }

  return errors
}

export function ClientsCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  uploadLoading = false,
  onClose,
  onSubmit,
}: ClientsCreateEditModalProps) {
  const [values, setValues] = useState<ClientsCreateEditFormValues>(initialValues)
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

  const setFieldValue = (key: keyof ClientsCreateEditFormValues, value: string) => {
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

    if (!selectedLogoFile && !values.logoUrl.trim()) {
      nextErrors.logo = 'Logo is required.'
    }

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
      title={mode === 'create' ? 'Create Client' : 'Edit Client'}
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
          placeholder="Acme Corporation"
          value={values.name}
          onChange={(event) => setFieldValue('name', event.target.value)}
          error={errors.name}
          helperText="Required, max 150 characters"
        />

        <Input
          label="Website URL"
          placeholder="https://example.com"
          value={values.website || ''}
          onChange={(event) => setFieldValue('website', event.target.value)}
          error={errors.website}
          helperText="Optional. Client company website link."
        />

        <ImageUploadField
          label="Logo"
          selectedFile={selectedLogoFile}
          existingImageUrl={values.logoUrl}
          previewAlt="Client logo preview"
          helperText="Required. Upload the client company logo."
          onRemove={() => {
            setSelectedLogoFile(null)
            setFieldValue('logoUrl', '')
          }}
          onFileChange={setSelectedLogoFile}
        />

        {errors.logo ? <p className="text-sm font-medium text-[var(--ui-danger)]">{errors.logo}</p> : null}
      </div>
    </Modal>
  )
}
