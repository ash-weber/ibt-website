import { useEffect, useState } from 'react'
import { ActionButton, Input, Modal } from '../../../../component'
import { ImageUploadField } from '../ImageUploadField'
import { getAbsoluteImageUrl } from '../../../../utils/image'

export type MembersCreateEditFormValues = {
  name: string
  role: string
  email: string
  linkedinUrl: string
  phone: string
  avatarUrl: string
}

type MembersCreateEditModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialValues: MembersCreateEditFormValues
  submitting: boolean
  uploadLoading: boolean
  onClose: () => void
  onSubmit: (values: MembersCreateEditFormValues, imageFile: File | null) => void
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function MembersCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting,
  uploadLoading,
  onClose,
  onSubmit,
}: MembersCreateEditModalProps) {
  const [formValues, setFormValues] = useState<MembersCreateEditFormValues>(initialValues)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof MembersCreateEditFormValues, string>>>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormValues(initialValues)
    setSelectedImageFile(null)
    setErrors({})
  }, [initialValues, isOpen])

  const handleFieldChange = (key: keyof MembersCreateEditFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }))
    }
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof MembersCreateEditFormValues, string>> = {}

    const name = formValues.name.trim()
    if (!name) {
      newErrors.name = 'Member name is required.'
    } else if (name.length > 120) {
      newErrors.name = 'Member name must be at most 120 characters long.'
    }

    const role = formValues.role.trim()
    if (!role) {
      newErrors.role = 'Member role is required.'
    } else if (role.length > 120) {
      newErrors.role = 'Member role must be at most 120 characters long.'
    }

    const email = formValues.email.trim()
    if (!email || !isValidEmail(email)) {
      newErrors.email = 'A valid member email is required.'
    }

    const phone = formValues.phone.trim()
    if (!phone || phone.length < 5 || phone.length > 30) {
      newErrors.phone = 'Phone must be between 5 and 30 characters.'
    }

    if (!formValues.avatarUrl && !selectedImageFile) {
      newErrors.avatarUrl = 'Member avatar is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formValues, selectedImageFile)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Member' : 'Edit Member'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <ActionButton intent="cancel" onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton intent="save" loading={submitting || uploadLoading} onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </ActionButton>
        </>
      }
    >
      <div className="grid gap-4">
        <Input
          label="Name"
          placeholder="Ava Johnson"
          value={formValues.name}
          onChange={(event) => handleFieldChange('name', event.target.value)}
          helperText="Required, max 120 characters"
        />
        {errors.name && <span className="text-xs text-[var(--ui-danger)]">{errors.name}</span>}

        <Input
          label="Role"
          placeholder="Research Engineer"
          value={formValues.role}
          onChange={(event) => handleFieldChange('role', event.target.value)}
          helperText="Required, max 120 characters"
        />
        {errors.role && <span className="text-xs text-[var(--ui-danger)]">{errors.role}</span>}

        <Input
          label="Email"
          placeholder="ava@company.com"
          value={formValues.email}
          onChange={(event) => handleFieldChange('email', event.target.value)}
          helperText="Required, valid email"
        />
        {errors.email && <span className="text-xs text-[var(--ui-danger)]">{errors.email}</span>}

        <Input
          label="LinkedIn URL"
          placeholder="https://www.linkedin.com/in/username"
          value={formValues.linkedinUrl}
          onChange={(event) => handleFieldChange('linkedinUrl', event.target.value)}
          helperText="Optional, valid URL"
        />

        <Input
          label="Phone"
          placeholder="+1 555 123 4567"
          value={formValues.phone}
          onChange={(event) => handleFieldChange('phone', event.target.value)}
          helperText="Required, 5 to 30 characters"
        />
        {errors.phone && <span className="text-xs text-[var(--ui-danger)]">{errors.phone}</span>}

        <ImageUploadField
          label="Member Avatar"
          selectedFile={selectedImageFile}
          existingImageUrl={getAbsoluteImageUrl(formValues.avatarUrl)}
          previewAlt="Member avatar preview"
          helperText="Required. Upload avatar image for this member."
          onRemove={() => {
            // Avatar is required, cannot be removed during edit
            if (!selectedImageFile) {
              setErrors((prev) => ({
                ...prev,
                avatarUrl: 'Member avatar is required and cannot be removed.',
              }))
            }
          }}
          onFileChange={setSelectedImageFile}
        />
        {errors.avatarUrl && <span className="text-xs text-[var(--ui-danger)]">{errors.avatarUrl}</span>}
      </div>
    </Modal>
  )
}
