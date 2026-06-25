import { useEffect, useState } from 'react'
import { ActionButton, Dropdown, Input, Modal } from '../../../../../component'
import type { BranchType } from '../../../../../types/branchesMaster'

type Mode = 'create' | 'edit'

export type BranchesCreateEditFormValues = {
  name: string
  location: string
  type: BranchType
}

type FormErrors = {
  name?: string
  location?: string
}

type BranchesCreateEditModalProps = {
  isOpen: boolean
  mode: Mode
  initialValues: BranchesCreateEditFormValues
  submitting?: boolean
  onClose: () => void
  onSubmit: (values: BranchesCreateEditFormValues) => void | Promise<void>
}

const BRANCH_FORM_TYPE_OPTIONS = [
  { label: 'Headquarters', value: 'HEADQUARTERS' },
  { label: 'Regional', value: 'REGIONAL' },
  { label: 'International', value: 'INTERNATIONAL' },
]

function validate(values: BranchesCreateEditFormValues): FormErrors {
  const errors: FormErrors = {}

  const name = values.name.trim()
  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length > 150) {
    errors.name = 'Name must be at most 150 characters long.'
  }

  const location = values.location.trim()
  if (!location) {
    errors.location = 'Location is required.'
  } else if (location.length > 200) {
    errors.location = 'Location must be at most 200 characters long.'
  }

  return errors
}

export function BranchesCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting = false,
  onClose,
  onSubmit,
}: BranchesCreateEditModalProps) {
  const [values, setValues] = useState<BranchesCreateEditFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(initialValues)
    setErrors({})
  }, [initialValues, isOpen])

  const setFieldValue = (key: keyof BranchesCreateEditFormValues, value: string) => {
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
      title={mode === 'create' ? 'Create Branch' : 'Edit Branch'}
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
        <Input
          label="Name"
          placeholder="IBT Dhaka HQ"
          value={values.name}
          onChange={(event) => setFieldValue('name', event.target.value)}
          error={errors.name}
          helperText="Required, max 150 characters"
        />

        <Input
          label="Location"
          placeholder="Banani, Dhaka"
          value={values.location}
          onChange={(event) => setFieldValue('location', event.target.value)}
          error={errors.location}
          helperText="Required, max 200 characters"
        />

        <div className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--ui-text)]">Type</span>
          <Dropdown
            options={BRANCH_FORM_TYPE_OPTIONS}
            value={values.type}
            onChange={(value) => setFieldValue('type', value as BranchType)}
          />
          <span className="text-xs text-[var(--ui-muted)]">Required branch classification.</span>
        </div>
      </div>
    </Modal>
  )
}
