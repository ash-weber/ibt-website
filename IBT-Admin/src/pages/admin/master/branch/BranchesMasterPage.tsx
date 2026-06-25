import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Dropdown, Loader, Pagination, SearchBox, Toast } from '../../../../component'
import {
  createBranchesMasterItem,
  deleteBranchesMasterItem,
  getBranchesMasterItems,
  updateBranchesMasterItem,
} from '../../../../api/branchesMaster'
import type { BranchMasterItem, BranchType } from '../../../../types/branchesMaster'
import { BranchesMasterCard } from './components/BranchesMasterCard'
import { BranchesCreateEditModal } from './components/BranchesCreateEditModal'
import type { BranchesCreateEditFormValues } from './components/BranchesCreateEditModal'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: BranchesCreateEditFormValues = {
  name: '',
  location: '',
  type: 'HEADQUARTERS',
}

const BRANCH_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Headquarters', value: 'HEADQUARTERS' },
  { label: 'Regional', value: 'REGIONAL' },
  { label: 'International', value: 'INTERNATIONAL' },
]

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function BranchesMasterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | BranchType>('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [formValues, setFormValues] = useState<BranchesCreateEditFormValues>(EMPTY_FORM_VALUES)

  const branchesQuery = useQuery({
    queryKey: ['master-branches', page, PAGE_LIMIT, search, typeFilter],
    queryFn: () =>
      getBranchesMasterItems({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        type: typeFilter || undefined,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createBranchesMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-branches'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Branch created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create branch.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updateBranchesMasterItem>[1] }) =>
      updateBranchesMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-branches'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Branch updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update branch.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBranchesMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-branches'] })
      setToastVariant('success')
      setToastMessage('Branch deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete branch.'))
      setToastOpen(true)
    },
  })

  const branches = useMemo(() => branchesQuery.data?.items ?? [], [branchesQuery.data])
  const meta = branchesQuery.data?.meta
  const hasNoCachedData = !branchesQuery.data

  const openCreateModal = () => {
    setMode('create')
    setEditId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (item: BranchMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      name: item.name,
      location: item.location,
      type: item.type,
    })
    setModalOpen(true)
  }

  const requestDelete = (item: BranchMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.name })
  }

  const confirmDelete = () => {
    if (!deleteTarget) {
      return
    }

    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleSearch = useCallback((value: string) => {
    setPage(1)
    setSearch(value)
  }, [])

  const handleModalSubmit = (values: BranchesCreateEditFormValues) => {
    const payload = {
      name: values.name.trim(),
      location: values.location.trim(),
      type: values.type,
    }

    if (mode === 'create') {
      createMutation.mutate(payload)
      return
    }

    if (!editId) {
      return
    }

    updateMutation.mutate({
      itemId: editId,
      payload,
    })
  }

  if (branchesQuery.isPending && page === 1 && !search && !typeFilter) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading branches" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading branches...</p>
          </div>
        </div>
      </div>
    )
  }

  if (branchesQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load branches</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(branchesQuery.error, 'Unable to load branches.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => branchesQuery.refetch()} leftIcon={<FiRefreshCw />}>
              Retry
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

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
        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto">
          <SearchBox
            placeholder="Search branch name"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-72"
          />

          <Dropdown
            options={BRANCH_TYPE_OPTIONS}
            value={typeFilter}
            onChange={(value) => {
              setPage(1)
              setTypeFilter((value || '') as '' | BranchType)
            }}
            className="w-full md:w-48"
            placeholder="Filter type"
          />
        </div>

        <div className="flex items-center gap-2">
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/branches/reorder')}>
            Reorder Branches
          </ActionButton>
          <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
            Add Branch
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {branchesQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading branches" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading branches...</p>
                </div>
              </div>
            </div>
          ) : branches.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {branches.map((branch) => (
                <BranchesMasterCard
                  key={branch.id}
                  branch={branch}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(branch)}
                  onManageTeam={(item) => navigate(`/admin/master/branches/${item.id}/team`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No branches found. Try creating one or updating filters.
              </div>
            </div>
          )}
        </div>
      </div>

      {meta ? (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasPrev={meta.hasPrev}
          hasNext={meta.hasNext}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      ) : null}

      <BranchesCreateEditModal
        isOpen={modalOpen}
        mode={mode}
        initialValues={formValues}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setModalOpen(false)
          setFormValues(EMPTY_FORM_VALUES)
          setEditId(null)
          setMode('create')
        }}
        onSubmit={handleModalSubmit}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemType="branch"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
