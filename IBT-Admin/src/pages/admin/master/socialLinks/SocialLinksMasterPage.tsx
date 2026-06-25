import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Loader, Pagination, Toast } from '../../../../component'
import {
  createSocialLinksMasterItem,
  deleteSocialLinksMasterItem,
  getSocialLinksMasterItems,
  updateSocialLinksMasterItem,
} from '../../../../api/socialLinksMaster'
import { SocialLinkCard } from './components/SocialLinkCard'
import { SocialLinkCreateEditModal } from './components/SocialLinkCreateEditModal'
import type { SocialLinkMasterItem, SocialLinkMasterPayload } from '../../../../types/socialLinksMaster'
import type { SocialLinkCreateEditFormValues } from './components/SocialLinkCreateEditModal'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: SocialLinkCreateEditFormValues = {
  platform: '',
  url: '',
  logoUrl: '',
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function SocialLinksMasterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [formValues, setFormValues] = useState<SocialLinkCreateEditFormValues>(EMPTY_FORM_VALUES)

  const linksQuery = useQuery({
    queryKey: ['master-social-links', page, PAGE_LIMIT],
    queryFn: () =>
      getSocialLinksMasterItems({
        page,
        limit: PAGE_LIMIT,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createSocialLinksMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-social-links'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Social link created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create social link.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: SocialLinkMasterPayload }) =>
      updateSocialLinksMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-social-links'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Social link updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update social link.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSocialLinksMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-social-links'] })
      setToastVariant('success')
      setToastMessage('Social link deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete social link.'))
      setToastOpen(true)
    },
  })

  const links = useMemo(() => linksQuery.data?.items ?? [], [linksQuery.data])
  const meta = linksQuery.data?.meta
  const hasNoCachedData = !linksQuery.data

  const openCreateModal = () => {
    setMode('create')
    setEditId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (item: SocialLinkMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      platform: item.platform,
      url: item.url,
      logoUrl: item.logoUrl,
    })
    setModalOpen(true)
  }

  const requestDelete = (item: SocialLinkMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.platform })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleModalSubmit = async (values: SocialLinkCreateEditFormValues) => {
    const payload: SocialLinkMasterPayload = {
      platform: values.platform,
      logoUrl: values.logoUrl.trim(),
      url: values.url.trim(),
    }

    if (mode === 'create') {
      createMutation.mutate(payload)
    } else if (editId) {
      updateMutation.mutate({ itemId: editId, payload })
    }
  }

  if (linksQuery.isPending && page === 1) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading social links" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading social links...</p>
          </div>
        </div>
      </div>
    )
  }

  if (linksQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load social links</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(linksQuery.error, 'Unable to load social links.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => linksQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
          <h1 className="text-lg font-bold text-[var(--ui-text)]">Social Links</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* We might not need reorder yet unless we have a Reorder page. I will disable the reorder button if not needed. Let's just add it pointing to reorder */}
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/social-links/reorder')}>
            Reorder Links
          </ActionButton>
          <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
            Add Link
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {linksQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading social links" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading social links...</p>
                </div>
              </div>
            </div>
          ) : links.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {links.map((link) => (
                <SocialLinkCard
                  key={link.id}
                  mode="manage"
                  link={link}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(link)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No social links found. Click "Add Link" to get started.
              </div>
            </div>
          )}
        </div>
      </div>

      {meta && meta.totalPages > 1 ? (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasPrev={meta.hasPrev}
          hasNext={meta.hasNext}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      ) : null}

      <SocialLinkCreateEditModal
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
        itemType="social link"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
