import { useEffect, useState } from 'react'
import { ActionButton, Input, Modal } from '../../../../../component'

type Mode = 'create' | 'edit'

export type StatsCreateEditFormValues = {
  label: string
  value: string
}

type FormErrors = {
  label?: string
  value?: string
}

type StatsCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: StatsCreateEditFormValues
  submitting?: boolean
  onClose: () => void
  onSubmit: (values: StatsCreateEditFormValues) => void | Promise<void>
}

function validate(values: StatsCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const label = values.label.trim()
  if (!label) {
    errors.label = 'Label is required.'
  } else if (label.length > 120) {
    errors.label = 'Label must be at most 120 characters long.'
  }

  const value = values.value.trim()
  if (!value) {
    errors.value = 'Value is required.'
  } else if (value.length > 120) {
    errors.value = 'Value must be at most 120 characters long.'
  }

  return errors
}

export function StatsCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  onClose,
  onSubmit,
}: StatsCreateEditModalProps) {
  const [values, setValues] = useState<StatsCreateEditFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof StatsCreateEditFormValues, value: string) => {
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
      title={mode === 'create' ? 'Create Stat' : 'Edit Stat'}
      onClose={onClose}
      size="md"
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
        <Input
          label="Label"
          placeholder="Projects Delivered"
          value={values.label}
          onChange={(event) => setFieldValue('label', event.target.value)}
          error={errors.label}
          helperText="Required, max 120 characters"
        />

        <Input
          label="Value"
          placeholder="120+"
          value={values.value}
          onChange={(event) => setFieldValue('value', event.target.value)}
          error={errors.value}
          helperText="Required, max 120 characters"
        />
      </div>
    </Modal>
  )
}
