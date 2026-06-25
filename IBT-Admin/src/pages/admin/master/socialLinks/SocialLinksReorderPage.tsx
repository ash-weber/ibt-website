import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiCheckCircle, FiChevronLeft, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionButton, Loader, Toast } from '../../../../component'
import { getAllSocialLinksMasterItems, updateSocialLinksMasterItem } from '../../../../api/socialLinksMaster'
import { SocialLinkCard } from './components/SocialLinkCard'
import type { SocialLinkMasterItem } from '../../../../types/socialLinksMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

const REORDER_QUERY_KEY = ['master-social-links-reorder']

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function sortLinks(items: SocialLinkMasterItem[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

function SortableReorderCard({ link }: { link: SocialLinkMasterItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        zIndex: isDragging ? 50 : 1,
        position: 'relative',
      }}
    >
      <SocialLinkCard
        mode="reorder"
        link={link}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  )
}

export function SocialLinksReorderPage() {
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
    queryFn: getAllSocialLinksMasterItems,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })


  // Actually, I should probably have a dedicated reorder API if the backend supports it, 
  // but following the pattern in StatsReorderPage.
  
  const links = useMemo(() => sortLinks(data ?? []), [data])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = links.findIndex((item) => item.id === active.id)
    const newIndex = links.findIndex((item) => item.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reordered = arrayMove(links, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    queryClient.setQueryData<SocialLinkMasterItem[]>(REORDER_QUERY_KEY, reordered)
    
    // Perform reorder mutation
    const performReorder = async () => {
      try {
        for (const [index, item] of reordered.entries()) {
          await updateSocialLinksMasterItem(item.id, {
            order: index + 1
          } as any)
        }
        setToastVariant('success')
        setToastMessage('Order updated successfully')
        setToastOpen(true)
        queryClient.invalidateQueries({ queryKey: ['master-social-links'] })
      } catch (err) {
        setToastVariant('error')
        setToastMessage('Failed to update order')
        setToastOpen(true)
        refetch()
      }
    }
    
    performReorder()
  }

  if (isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading social links" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading all social links for reorder...</p>
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
          <p className="text-base font-semibold text-red-800">Could not load social links</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(error, 'Unable to load social links.')}</p>
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
        <ActionButton size="sm" intent="ghost" leftIcon={<FiChevronLeft />} onClick={() => navigate('/admin/master/social-links')}>
          Back to Social Links
        </ActionButton>

        <p className="flex items-center gap-2 text-xs text-[var(--ui-muted)]">
          <FiCheckCircle size={14} />
          Drag cards to reorder. Changes are saved automatically.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {links.length > 0 ? (
          <SortableContext items={links.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {links.map((link) => (
                <SortableReorderCard key={link.id} link={link} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
            No social links available to reorder.
          </div>
        )}
      </DndContext>
    </div>
  )
}
