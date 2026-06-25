import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle, FiLayout } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Loader, Pagination, Toast } from '../../../../component'
import {
  createServicesMasterItem,
  deleteServicesMasterItem,
  getServicesMasterItems,
  updateServicesMasterItem,
  uploadServiceImage,
} from '../../../../api/servicesMaster'
import { ServiceMasterCard } from './components/ServiceMasterCard'
import {
  ServiceCreateEditModal,
  type ServiceCreateEditFormValues,
} from './components/ServiceCreateEditModal'
import type { ServiceMasterItem } from '../../../../types/servicesMaster'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM: ServiceCreateEditFormValues = {
  title: '',
  slug: '',
  description: '',
  tags: '',
  imageUrl: '',
  projectUrl: '',
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function parseTags(tagsValue: string) {
  return tagsValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function mapItemToForm(item: ServiceMasterItem): ServiceCreateEditFormValues {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    tags: item.tags.join(', '),
    imageUrl: item.imageUrl,
    projectUrl: item.projectUrl || '',
  }
}

export function ServicesMasterPage() {
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
  const [formInitialValues, setFormInitialValues] = useState<ServiceCreateEditFormValues>(EMPTY_FORM)

  const servicesQuery = useQuery({
    queryKey: ['master-services', page, PAGE_LIMIT],
    queryFn: () =>
      getServicesMasterItems({
        page,
        limit: PAGE_LIMIT,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createServicesMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-services'] })
      setModalOpen(false)
      setToastVariant('success')
      setToastMessage('Service created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create service.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updateServicesMasterItem>[1] }) =>
      updateServicesMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-services'] })
      setModalOpen(false)
      setToastVariant('success')
      setToastMessage('Service updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update service.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteServicesMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-services'] })
      setToastVariant('success')
      setToastMessage('Service deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete service.'))
      setToastOpen(true)
    },
  })

  const uploadImageMutation = useMutation({
    mutationFn: uploadServiceImage,
  })

  const services = useMemo(() => servicesQuery.data?.items ?? [], [servicesQuery.data])
  const meta = servicesQuery.data?.meta
  const hasNoCachedData = !servicesQuery.data

  const openCreateModal = () => {
    setMode('create')
    setEditId(null)
    setFormInitialValues(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEditModal = (item: ServiceMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormInitialValues(mapItemToForm(item))
    setModalOpen(true)
  }

  const requestDelete = (item: ServiceMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.title })
  }
  
    const handleViewDetails = (item: ServiceMasterItem) => {
      navigate(`/admin/master/services/${item.id}`)
    }

  const confirmDelete = () => {
    if (!deleteTarget) {
      return
    }

    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleSubmit = (values: ServiceCreateEditFormValues, selectedImageFile: File | null) => {
    const save = async () => {
      let imageUrl = values.imageUrl

      if (selectedImageFile) {
        const uploaded = await uploadImageMutation.mutateAsync(selectedImageFile)
        imageUrl = uploaded.relativeUrl || uploaded.absoluteUrl
      }

      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        imageUrl,
        tags: parseTags(values.tags),
        projectUrl: values.projectUrl?.trim() || undefined,
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

    save().catch((err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to save service.'))
      setToastOpen(true)
    })
  }

  // Show loading for empty initial load (not for page changes)
  if (servicesQuery.isPending && page === 1) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading services" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading services...</p>
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
          <p className="text-base font-semibold text-red-800">Could not load services</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(servicesQuery.error, 'Unable to load services.')}</p>
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

      {/* Header with action buttons */}
      <div className="sticky top-[4.5rem] z-10 flex flex-wrap items-center justify-end gap-2 border-b border-[var(--ui-border)] bg-white px-4 py-3 shadow-[var(--ui-shadow-sm)] md:px-6">
        <ActionButton size="sm" intent="ghost" leftIcon={<FiLayout />} onClick={() => navigate('/admin/master/services/content')}>
          Manage Page Content
        </ActionButton>
        <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/services/reorder')}>
          Reorder Services
        </ActionButton>
        <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
          Add Service
        </ActionButton>
      </div>

      {/* Content area - flex-1 to push pagination to bottom */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Services grid or empty state */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {servicesQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading services" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading services...</p>
                </div>
              </div>
            </div>
          ) : services.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceMasterCard
                  key={service.id}
                  mode="manage"
                  service={service}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(service)}
                   onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No services yet. Create your first service.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed pagination at bottom */}
      {meta ? (
        <div className="">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            hasPrev={meta.hasPrev}
            hasNext={meta.hasNext}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      ) : null}

      <ServiceCreateEditModal
        isOpen={modalOpen}
        mode={mode}
        initialValues={formInitialValues}
        submitting={createMutation.isPending || updateMutation.isPending}
        uploadLoading={uploadImageMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemType="service"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
