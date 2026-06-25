import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiCheckCircle, FiChevronLeft, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionButton, Loader, Toast } from '../../../../component'
import { getAllPartnersMasterItems, updatePartnersMasterItem } from '../../../../api/partnersMaster'
import { PartnersMasterCard } from './components/PartnersMasterCard'
import type { PartnerMasterItem } from '../../../../types/partnersMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

const REORDER_QUERY_KEY = ['master-partners-reorder']

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function sortPartners(items: PartnerMasterItem[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

function SortableReorderCard({ partner }: { partner: PartnerMasterItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: partner.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
      }}
    >
      <PartnersMasterCard
        mode="reorder"
        partner={partner}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  )
}

export function PartnersReorderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: REORDER_QUERY_KEY,
    queryFn: getAllPartnersMasterItems,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (const [index, id] of orderedIds.entries()) {
        await updatePartnersMasterItem(id, {
          order: index + 1,
        })
      }

      return orderedIds
    },
    onSuccess: () => {
      setToastVariant('success')
      setToastMessage('Partner order updated.')
      setToastOpen(true)
    },
    onError: (err) => {
      refetch()
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to reorder partners.'))
      setToastOpen(true)
    },
  })

  const partners = useMemo(() => sortPartners(data ?? []), [data])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = partners.findIndex((item) => item.id === active.id)
    const newIndex = partners.findIndex((item) => item.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reordered = arrayMove(partners, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    queryClient.setQueryData<PartnerMasterItem[]>(REORDER_QUERY_KEY, reordered)
    reorderMutation.mutate(reordered.map((item) => item.id))
  }

  if (isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading partners" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading all partners for reorder...</p>
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
          <p className="text-base font-semibold text-red-800">Could not load partners</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(error, 'Unable to load partners.')}</p>
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
        <ActionButton size="sm" intent="ghost" leftIcon={<FiChevronLeft />} onClick={() => navigate('/admin/master/partners')}>
          Back to Partners
        </ActionButton>

        <p className="flex items-center gap-2 text-xs text-[var(--ui-muted)]">
          <FiCheckCircle size={14} />
          Drag cards to reorder. All partners are loaded on this page.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {partners.length > 0 ? (
          <SortableContext items={partners.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((partner) => (
                <SortableReorderCard key={partner.id} partner={partner} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
            No partners available to reorder.
          </div>
        )}
      </DndContext>
    </div>
  )
}
