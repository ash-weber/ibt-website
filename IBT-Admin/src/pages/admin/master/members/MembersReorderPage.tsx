import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiCheckCircle, FiChevronLeft, FiRefreshCw, FiSave } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionButton, Loader, Toast } from '../../../../component'
import { getAllMembersMasterItems, updateMembersMasterItem } from '../../../../api/membersMaster'
import { updateBranchMemberOrder } from '../../../../api/branchesMaster'
import { MembersMasterCard } from '../../components/members/MembersMasterCard'
import type { MemberMasterItem } from '../../../../types/membersMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

const REORDER_QUERY_KEY = ['master-members-reorder']

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function sortMembers(items: MemberMasterItem[]) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function SortableReorderCard({ member }: { member: MemberMasterItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
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
      <MembersMasterCard
        member={member}
        mode="reorder"
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  )
}

export function MembersReorderPage() {
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
    queryFn: getAllMembersMasterItems,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Persist ordering on the BranchMember junction rows.
      // Each member may belong to one or more branches; update the order for
      // every branch association so the public client pages (which read
      // branch members) show the new order.
      for (const [index, id] of orderedIds.entries()) {
        const item = localMembers.find((m) => m.id === id)
        if (!item) continue

        // Update the member's global order
        await updateMembersMasterItem(id, { order: index + 1 })

        // If the member has branch associations, update each one.
        if (item.branches && item.branches.length > 0) {
          for (const b of item.branches) {
            try {
              await updateBranchMemberOrder(b.branchId, item.id, index + 1)
            } catch (e) {
              // ignore individual failures and continue; the onError handler
              // will surface a failure if needed
            }
          }
        }
      }

      return orderedIds
    },
    onSuccess: () => {
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: REORDER_QUERY_KEY })
      setToastVariant('success')
      setToastMessage('Member order saved successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      refetch()
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to save member order.'))
      setToastOpen(true)
    },
  })

  const [localMembers, setLocalMembers] = useState<MemberMasterItem[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (data) {
      setLocalMembers(sortMembers(data))
      setHasChanges(false)
    }
  }, [data])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = localMembers.findIndex((item) => item.id === active.id)
    const newIndex = localMembers.findIndex((item) => item.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reordered = arrayMove(localMembers, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    setLocalMembers(reordered)
    setHasChanges(true)
  }

  const handleSave = () => {
    reorderMutation.mutate(localMembers.map((item) => item.id))
  }

  if (isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading members" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading all members for reorder...</p>
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
          <p className="text-base font-semibold text-red-800">Could not load members</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(error, 'Unable to load members.')}</p>
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
        <div className="flex gap-3">
          <ActionButton size="sm" intent="ghost" leftIcon={<FiChevronLeft />} onClick={() => navigate('/admin/master/members')}>
            Back to Members
          </ActionButton>
          <ActionButton 
            size="sm" 
            intent="primary" 
            leftIcon={<FiSave />} 
            onClick={handleSave} 
            disabled={!hasChanges || reorderMutation.isPending}
            loading={reorderMutation.isPending}
          >
            Save Order
          </ActionButton>
        </div>

        <p className="flex items-center gap-2 text-xs text-[var(--ui-muted)]">
          <FiCheckCircle size={14} />
          Drag cards to reorder. All members are loaded on this page.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {localMembers.length > 0 ? (
          <SortableContext items={localMembers.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {localMembers.map((member) => (
                <SortableReorderCard key={member.id} member={member} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
            No members available to reorder.
          </div>
        )}
      </DndContext>
    </div>
  )
}
