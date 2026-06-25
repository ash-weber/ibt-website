import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiChevronLeft, FiRefreshCw, FiShuffle, FiUserPlus, FiX } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { ActionButton, Loader, Modal, Pagination, SearchBox, Toast } from '../../../../component'
import {
  assignMemberToBranch,
  getBranchMasterItem,
  getBranchMembersPaginated,
  removeMemberFromBranch,
} from '../../../../api/branchesMaster'
import { getMembersMasterItems } from '../../../../api/membersMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

const PAGE_LIMIT = 10
const ADD_MEMBER_PAGE_LIMIT = 5

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function BranchTeamPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { branchId = '' } = useParams()
  const membersListRef = useRef<HTMLDivElement>(null)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addMemberSearch, setAddMemberSearch] = useState('')
  const [addMemberPage, setAddMemberPage] = useState(1)
  const [assigningMemberId, setAssigningMemberId] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  // Scroll to top when page changes
  useEffect(() => {
    if (membersListRef.current) {
      membersListRef.current.scrollTop = 0
    }
  }, [page])

  const branchQuery = useQuery({
    queryKey: ['master-branch', branchId],
    queryFn: () => getBranchMasterItem(branchId),
    enabled: Boolean(branchId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const addMembersQuery = useQuery({
    queryKey: ['members-assignable-search', addMemberSearch, addMemberPage],
    queryFn: () =>
      getMembersMasterItems({
        page: addMemberPage,
        limit: ADD_MEMBER_PAGE_LIMIT,
        search: addMemberSearch || undefined,
      }),
    enabled: addModalOpen,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const branchMembersQuery = useQuery({
    queryKey: ['branch-members', branchId, page, search],
    queryFn: () =>
      getBranchMembersPaginated(branchId, {
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
      }),
    enabled: Boolean(branchId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const assignMutation = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) => assignMemberToBranch(branchId, { memberId }),
    onMutate: ({ memberId }) => {
      setAssigningMemberId(memberId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-branches'] })
      queryClient.invalidateQueries({ queryKey: ['master-branch', branchId] })
      queryClient.invalidateQueries({ queryKey: ['branch-members', branchId] })
      queryClient.invalidateQueries({ queryKey: ['members-assignable-search'] })
      setToastVariant('success')
      setToastMessage('Member assigned to branch.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to assign member.'))
      setToastOpen(true)
    },
    onSettled: () => {
      setAssigningMemberId(null)
    },
  })

  const removeMutation = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) => removeMemberFromBranch(branchId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-branches'] })
      queryClient.invalidateQueries({ queryKey: ['master-branch', branchId] })
      queryClient.invalidateQueries({ queryKey: ['branch-members', branchId] })
      setToastVariant('success')
      setToastMessage('Member removed from branch.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to remove member from branch.'))
      setToastOpen(true)
    },
  })

  const branchName = useMemo(() => branchQuery.data?.name ?? null, [branchQuery.data?.name])
  const branchType = useMemo(() => branchQuery.data?.type ?? null, [branchQuery.data?.type])
  const branchCount = useMemo(() => branchQuery.data?._count.teamMembers ?? 0, [branchQuery.data?._count.teamMembers])

  const paginatedMembers = useMemo(() => branchMembersQuery.data?.items ?? [], [branchMembersQuery.data])
  const membersMeta = branchMembersQuery.data?.meta

  // Get assigned member IDs from paginated members (current page) + compute globally from total
  const assignedIds = useMemo(() => {
    const ids = new Set<string>()
    // Mark members from the current page as assigned
    paginatedMembers.forEach((item) => {
      ids.add(item.memberId)
    })
    return ids
  }, [paginatedMembers])

  const availableMembers = useMemo(() => {
    return (addMembersQuery.data?.items ?? []).map((member) => ({
      ...member,
      alreadyAssigned: assignedIds.has(member.id),
    }))
  }, [addMembersQuery.data, assignedIds])

  const handleAssignedSearch = useCallback((value: string) => {
    setPage(1)
    setSearch(value)
  }, [])

  const handleAddMemberSearch = useCallback((value: string) => {
    setAddMemberPage(1)
    setAddMemberSearch(value)
  }, [])

  // Only show full loading on initial branch load or on first page of members (without search)
  if ((branchQuery.isPending && !branchQuery.data) || (branchMembersQuery.isPending && page === 1 && !search)) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full items-center justify-center p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading branch team" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading branch team...</p>
          </div>
        </div>
      </div>
    )
  }

  if (branchMembersQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <p className="text-base font-semibold text-red-800">Could not load branch members</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(branchMembersQuery.error, 'Unable to load branch members.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => branchMembersQuery.refetch()} leftIcon={<FiRefreshCw />}>
              Retry
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

  const hasNoCachedData = !branchMembersQuery.data

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col">
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Success' : 'Error'}
        onClose={() => setToastOpen(false)}
      />

      <div className="sticky top-[4.5rem] z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ui-border)] bg-white px-4 py-3 shadow-[var(--ui-shadow-sm)] md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton size="sm" intent="ghost" leftIcon={<FiChevronLeft />} onClick={() => navigate('/admin/master/branches')}>
            Back to Branches
          </ActionButton>
          <p className="text-sm font-semibold text-[var(--ui-text)]">{branchName ?? 'Branch Team'} <span className='text-sm font-bold text-[var(--ui-primary)]'>({branchType})</span></p>
            <p className="inline-flex items-center gap-1 rounded-full bg-[var(--ui-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--ui-muted)]">
                {branchCount} {branchCount === 1 ? 'Member' : 'Members'}
            </p>
        </div>

        <div className="flex items-center gap-2">
            <SearchBox
              placeholder="Search assigned members"
              defaultValue={search}
              onSearch={handleAssignedSearch}
            />
          <ActionButton
            size="sm"
            intent="secondary"
            leftIcon={<FiUserPlus />}
            onClick={() => {
              setAddMemberSearch('')
              setAddMemberPage(1)
              setAddModalOpen(true)
            }}
          >
            Add Member
          </ActionButton>
          <ActionButton
            size="sm"
            intent="ghost"
            leftIcon={<FiShuffle />}
            onClick={() => navigate(`/admin/master/branches/${branchId}/team/reorder`)}
          >
            Reorder Team
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div ref={membersListRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {branchMembersQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading members" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading members...</p>
                </div>
              </div>
            </div>
          ) : paginatedMembers.length > 0 ? (
            <div className="grid gap-2">
              {paginatedMembers.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--ui-border)] bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{assignment.member.name}</p>
                    <p className="line-clamp-1 text-xs text-[var(--ui-muted)]">
                      {assignment.member.role} • {assignment.member.email} • Order #{assignment.order}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <ActionButton
                      size="sm"
                      intent="ghost"
                      leftIcon={<FiX />}
                      loading={removeMutation.isPending}
                      onClick={() => removeMutation.mutate({ memberId: assignment.memberId })}
                    >
                      Remove
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-5 text-center text-sm text-[var(--ui-muted)]">
              No members found for this branch.
            </div>
          )}
        </div>
      </div>

      {membersMeta ? (
        <div className="">
          <Pagination
            page={membersMeta.page}
            totalPages={membersMeta.totalPages}
            hasPrev={membersMeta.hasPrev}
            hasNext={membersMeta.hasNext}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      ) : null}

      <Modal
        isOpen={addModalOpen}
        title={`Add Member - ${branchName ?? 'Branch'}`}
        onClose={() => setAddModalOpen(false)}
        size="lg"
      >
        <div className="grid gap-4">
          <SearchBox
            placeholder="Search members to add"
            defaultValue={addMemberSearch}
            onSearch={handleAddMemberSearch}
          />

          {addMembersQuery.isPending ? (
            <div className="rounded-lg border border-[var(--ui-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <Loader size="sm" label="Loading members" />
                <span className="text-sm text-[var(--ui-muted)]">Loading members...</span>
              </div>
            </div>
          ) : availableMembers.length > 0 ? (
            <div className="grid gap-2">
              {availableMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--ui-border)] bg-white p-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{member.name}</p>
                    <p className="line-clamp-1 text-xs text-[var(--ui-muted)]">{member.role} • {member.email}</p>
                  </div>

                  <ActionButton
                    size="sm"
                    intent="secondary"
                    leftIcon={<FiUserPlus />}
                    disabled={member.alreadyAssigned}
                    loading={assignMutation.isPending && assigningMemberId === member.id}
                    onClick={() => {
                      if (member.alreadyAssigned) {
                        return
                      }
                      assignMutation.mutate({ memberId: member.id })
                    }}
                  >
                    {member.alreadyAssigned ? 'Assigned' : 'Assign'}
                  </ActionButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-5 text-center text-sm text-[var(--ui-muted)]">
              No members found.
            </div>
          )}

          {addMembersQuery.data?.meta ? (
            <Pagination
              page={addMembersQuery.data.meta.page}
              totalPages={addMembersQuery.data.meta.totalPages}
              hasPrev={addMembersQuery.data.meta.hasPrev}
              hasNext={addMembersQuery.data.meta.hasNext}
              onPageChange={(nextPage) => setAddMemberPage(nextPage)}
            />
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
