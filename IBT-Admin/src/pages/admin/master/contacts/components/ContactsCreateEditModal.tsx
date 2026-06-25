import { useEffect, useState } from 'react'
import { ActionButton, Dropdown, Input, Modal } from '../../../../../component'
import type { ContactType } from '../../../../../types/contactsMaster'

type Mode = 'create' | 'edit'

export type ContactsCreateEditFormValues = {
  type: ContactType
  value: string
}

type FormErrors = {
  value?: string
}

type ContactsCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: ContactsCreateEditFormValues
  submitting?: boolean
  onClose: () => void
  onSubmit: (values: ContactsCreateEditFormValues) => void | Promise<void>
}

const CONTACT_FORM_TYPE_OPTIONS = [
  { label: 'Phone', value: 'PHONE' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Address', value: 'ADDRESS' },
]

function validate(values: ContactsCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const value = values.value.trim()
  if (!value) {
    errors.value = 'Value is required.'
  } else if (value.length > 500) {
    errors.value = 'Value must be at most 500 characters long.'
  }

  return errors
}

export function ContactsCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  onClose,
  onSubmit,
}: ContactsCreateEditModalProps) {
  const [values, setValues] = useState<ContactsCreateEditFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof ContactsCreateEditFormValues, value: string) => {
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
    onSubmit(values)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={mode === 'create' ? 'Create Contact' : 'Edit Contact'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <ActionButton intent="cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </ActionButton>
          <ActionButton intent="save" loading={submitting} onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </ActionButton>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Type</span>
          <Dropdown
            options={CONTACT_FORM_TYPE_OPTIONS}
            value={values.type}
            onChange={(value) => setFieldValue('type', value as ContactType)}
          />
          <span className="text-xs text-[var(--ui-muted)]">Choose contact type.</span>
        </div>

        <Input
          label="Value"
          placeholder="+880 1234-567890 / hello@example.com / Office address"
          value={values.value}
          onChange={(event) => setFieldValue('value', event.target.value)}
          error={errors.value}
          helperText="Required, max 500 characters"
        />
      </div>
    </Modal>
  )
}
