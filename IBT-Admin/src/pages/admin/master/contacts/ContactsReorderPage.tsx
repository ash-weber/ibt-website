import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiCheckCircle, FiChevronLeft, FiMove, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionButton, Loader, Toast } from '../../../../component'
import { getAllContactsMasterItems, updateContactsMasterItem } from '../../../../api/contactsMaster'
import type { ContactMasterItem, ContactType } from '../../../../types/contactsMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

const REORDER_QUERY_KEY = ['master-contacts-reorder']

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function sortContacts(items: ContactMasterItem[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

function getTypeBadge(type: ContactType) {
  if (type === 'PHONE') return 'Phone'
  if (type === 'EMAIL') return 'Email'
  return 'Address'
}

function SortableContactCard({ contact }: { contact: ContactMasterItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: contact.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
      }}
      className="rounded-xl border border-[var(--ui-border)] bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{contact.value}</p>
          <p className="mt-1 text-xs text-[var(--ui-muted)]">
            {getTypeBadge(contact.type)} • Order #{contact.order}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-md border border-[var(--ui-border)] text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)] active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder contact"
        >
          <FiMove />
        </button>
      </div>
    </div>
  )
}

export function ContactsReorderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: REORDER_QUERY_KEY,
    queryFn: () => getAllContactsMasterItems(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (const [index, id] of orderedIds.entries()) {
        await updateContactsMasterItem(id, { order: index + 1 })
      }
      return orderedIds
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-contacts'] })
      setToastVariant('success')
      setToastMessage('Contact order updated.')
      setToastOpen(true)
    },
    onError: (err) => {
      refetch()
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to reorder contacts.'))
      setToastOpen(true)
    },
  })

  const contacts = useMemo(() => sortContacts(data ?? []), [data])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = contacts.findIndex((item) => item.id === active.id)
    const newIndex = contacts.findIndex((item) => item.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reordered = arrayMove(contacts, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    queryClient.setQueryData<ContactMasterItem[]>(REORDER_QUERY_KEY, reordered)
    reorderMutation.mutate(reordered.map((item) => item.id))
  }

  if (isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading contacts" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading all contacts for reorder...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load contacts</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(error, 'Unable to load contacts.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => refetch()} leftIcon={<FiRefreshCw />}>
              Retry
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col gap-4 p-4 md:p-6">
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Success' : 'Error'}
        onClose={() => setToastOpen(false)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-3 shadow-[var(--ui-shadow-sm)]">
        <ActionButton size="sm" intent="ghost" leftIcon={<FiChevronLeft />} onClick={() => navigate('/admin/master/contacts')}>
          Back to Contacts
        </ActionButton>

        <p className="flex items-center gap-2 text-xs text-[var(--ui-muted)]">
          <FiCheckCircle size={14} />
          Drag cards to reorder. All contacts are loaded on this page.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {contacts.length > 0 ? (
          <SortableContext items={contacts.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contacts.map((contact) => (
                <SortableContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
            No contacts available to reorder.
          </div>
        )}
      </DndContext>
    </div>
  )
}
