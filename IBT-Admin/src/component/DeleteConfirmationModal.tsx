import { useEffect, useRef, useState } from 'react'
import { ActionButton } from './ActionButton'
import { Modal } from './Modal'

type DeleteConfirmationModalProps = {
  isOpen: boolean
  itemLabel?: string
  itemType?: string
  loading?: boolean
  minLoadingMs?: number
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmationModal({
  isOpen,
  itemLabel,
  itemType = 'item',
  loading = false,
  minLoadingMs = 1000,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [minLoadingActive, setMinLoadingActive] = useState(false)
  const minLoadingTimeoutRef = useRef<number | null>(null)

  const buttonLoading = loading || minLoadingActive

  useEffect(() => {
    return () => {
      if (minLoadingTimeoutRef.current !== null) {
        window.clearTimeout(minLoadingTimeoutRef.current)
      }
    }
  }, [])

  const handleConfirm = () => {
    if (buttonLoading) {
      return
    }

    setMinLoadingActive(true)

    if (minLoadingTimeoutRef.current !== null) {
      window.clearTimeout(minLoadingTimeoutRef.current)
    }

    minLoadingTimeoutRef.current = window.setTimeout(() => {
      setMinLoadingActive(false)
      minLoadingTimeoutRef.current = null
      onConfirm()
    }, Math.max(minLoadingMs, 0))
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Confirm Deletion"
      onClose={buttonLoading ? () => undefined : onCancel}
      size="sm"
      closeOnOverlayClick={!buttonLoading}
      closeOnEsc={!buttonLoading}
      footer={
        <>
          <ActionButton intent="cancel" onClick={onCancel} disabled={buttonLoading}>
            Cancel
          </ActionButton>
          <ActionButton intent="delete" confirmDestructive={false} loading={buttonLoading} onClick={handleConfirm}>
            Delete
          </ActionButton>
        </>
      }
    >
      <p className="text-sm text-[var(--ui-text)]">
        Are you sure you want to delete this {itemType}
        {itemLabel ? <span className="font-semibold">: {itemLabel}</span> : ''}?
      </p>
      <p className="mt-2 text-xs text-[var(--ui-muted)]">This action cannot be undone.</p>
    </Modal>
  )
}