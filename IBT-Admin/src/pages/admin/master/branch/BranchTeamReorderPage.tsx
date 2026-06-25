import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiCheckCircle, FiChevronLeft, FiRefreshCw } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionButton, Loader, Toast } from '../../../../component'
import { getAllBranchMembers, getAllBranchesMasterItems, updateBranchMemberOrder } from '../../../../api/branchesMaster'
import type { BranchMemberAssignment } from '../../../../types/branchesMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function sortAssignments(items: BranchMemberAssignment[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

function SortableTeamCard({ assignment }: { assignment: BranchMemberAssignment }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: assignment.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
      }}
      className="rounded-lg border border-[var(--ui-border)] bg-white p-3"
    >
      <button
        type="button"
        className="mb-2 cursor-grab rounded-md border border-[var(--ui-border)] px-2 py-1 text-xs text-[var(--ui-muted)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        Drag
      </button>
      <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{assignment.member.name}</p>
      <p className="line-clamp-1 text-xs text-[var(--ui-muted)]">{assignment.member.role} • Order #{assignment.order}</p>
    </div>
  )
}

export function BranchTeamReorderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { branchId = '' } = useParams()

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

  const branchesQuery = useQuery({
    queryKey: ['master-branches-all'],
    queryFn: getAllBranchesMasterItems,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const teamQuery = useQuery({
    queryKey: ['branch-members', branchId],
    queryFn: () => getAllBranchMembers(branchId),
    enabled: Boolean(branchId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const reorderMutation = useMutation({
    mutationFn: async (orderedItems: BranchMemberAssignment[]) => {
      for (const [index, item] of orderedItems.entries()) {
        await updateBranchMemberOrder(branchId, item.memberId, index + 1)
      }
      return orderedItems
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-branches'] })
      setToastVariant('success')
      setToastMessage('Branch team order updated.')
      setToastOpen(true)
    },
    onError: (err) => {
      teamQuery.refetch()
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to reorder branch team.'))
      setToastOpen(true)
    },
  })

  const branch = useMemo(
    () => (branchesQuery.data ?? []).find((item) => item.id === branchId) ?? null,
    [branchesQuery.data, branchId],
  )

  const assignments = useMemo(() => sortAssignments(teamQuery.data ?? []), [teamQuery.data])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = assignments.findIndex((item) => item.id === active.id)
    const newIndex = assignments.findIndex((item) => item.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reordered = arrayMove(assignments, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    queryClient.setQueryData<BranchMemberAssignment[]>(['branch-members', branchId], reordered)
    reorderMutation.mutate(reordered)
  }

  if (teamQuery.isPending || branchesQuery.isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading team reorder" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading team reorder data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (teamQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load team reorder data</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(teamQuery.error, 'Unable to load team members.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => teamQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
        <ActionButton size="sm" intent="ghost" leftIcon={<FiChevronLeft />} onClick={() => navigate(`/admin/master/branches/${branchId}/team`)}>
          Back to Team
        </ActionButton>

        <p className="flex items-center gap-2 text-xs text-[var(--ui-muted)]">
          <FiCheckCircle size={14} />
          {branch?.name ?? 'Branch'}: drag cards to reorder team members.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {assignments.length > 0 ? (
          <SortableContext items={assignments.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {assignments.map((assignment) => (
                <SortableTeamCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
            No assigned members available to reorder.
          </div>
        )}
      </DndContext>
    </div>
  )
}
