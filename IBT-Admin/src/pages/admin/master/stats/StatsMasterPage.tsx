import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Loader, Pagination, SearchBox, Toast } from '../../../../component'
import {
  createStatsMasterItem,
  deleteStatsMasterItem,
  getStatsMasterItems,
  updateStatsMasterItem,
} from '../../../../api/statsMaster'
import { StatsMasterCard } from './components/StatsMasterCard'
import { StatsCreateEditModal } from './components/StatsCreateEditModal'
import type { StatMasterItem } from '../../../../types/statsMaster'
import type { StatsCreateEditFormValues } from './components/StatsCreateEditModal'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: StatsCreateEditFormValues = {
  label: '',
  value: '',
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function StatsMasterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [formValues, setFormValues] = useState<StatsCreateEditFormValues>(EMPTY_FORM_VALUES)

  const servicesQuery = useQuery({
    queryKey: ['master-stats', page, PAGE_LIMIT, search],
    queryFn: () =>
      getStatsMasterItems({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createStatsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-stats'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Stat created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create stat.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updateStatsMasterItem>[1] }) =>
      updateStatsMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-stats'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Stat updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update stat.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStatsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-stats'] })
      setToastVariant('success')
      setToastMessage('Stat deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete stat.'))
      setToastOpen(true)
    },
  })

  const stats = useMemo(() => servicesQuery.data?.items ?? [], [servicesQuery.data])
  const meta = servicesQuery.data?.meta
  const hasNoCachedData = !servicesQuery.data

  const openCreateModal = () => {
    setMode('create')
    setEditId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (item: StatMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      label: item.label,
      value: item.value,
    })
    setModalOpen(true)
  }

  const requestDelete = (item: StatMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.label })
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

  const handleModalSubmit = (values: StatsCreateEditFormValues) => {
    const payload = {
      label: values.label,
      value: values.value,
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

  if (servicesQuery.isPending && page === 1 && !search) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading stats" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading stats...</p>
          </div>
        </div>
      </div>
    )
  }

  if (servicesQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load stats</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(servicesQuery.error, 'Unable to load stats.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => servicesQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
            placeholder="Search stat labels"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-72"
          />

        </div>

        <div className="flex items-center gap-2">
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/stats/reorder')}>
            Reorder Stats
          </ActionButton>
          <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
            Add Stat
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {servicesQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading stats" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading stats...</p>
                </div>
              </div>
            </div>
          ) : stats.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => (
                <StatsMasterCard
                  key={stat.id}
                  mode="manage"
                  stat={stat}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(stat)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No stats found. Try creating one or updating the search.
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

      <StatsCreateEditModal
        isOpen={modalOpen}
        mode={mode}
        initialValues={formValues}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemType="stat"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
