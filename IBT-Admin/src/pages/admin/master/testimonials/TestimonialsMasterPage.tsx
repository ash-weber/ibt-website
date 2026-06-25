import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Loader, Pagination, SearchBox, Toast } from '../../../../component'
import {
  createTestimonialsMasterItem,
  deleteTestimonialsMasterItem,
  getTestimonialsMasterItems,
  uploadTestimonialAvatar,
  updateTestimonialsMasterItem,
} from '../../../../api/testimonialsMaster'
import { TestimonialsMasterCard } from './components/TestimonialsMasterCard'
import { TestimonialsCreateEditModal } from './components/TestimonialsCreateEditModal'
import type { TestimonialMasterItem, TestimonialMasterPayload } from '../../../../types/testimonialsMaster'
import type { TestimonialsCreateEditFormValues } from './components/TestimonialsCreateEditModal'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: TestimonialsCreateEditFormValues = {
  name: '',
  content: '',
  role: '',
  company: '',
  avatarUrl: '',
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function TestimonialsMasterPage() {
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
  const [formValues, setFormValues] = useState<TestimonialsCreateEditFormValues>(EMPTY_FORM_VALUES)
  // const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)

  const testimonialsQuery = useQuery({
    queryKey: ['master-testimonials', page, PAGE_LIMIT, search],
    queryFn: () =>
      getTestimonialsMasterItems({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createTestimonialsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-testimonials'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Testimonial created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create testimonial.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updateTestimonialsMasterItem>[1] }) =>
      updateTestimonialsMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-testimonials'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Testimonial updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update testimonial.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonialsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-testimonials'] })
      setToastVariant('success')
      setToastMessage('Testimonial deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete testimonial.'))
      setToastOpen(true)
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadTestimonialAvatar,
  })

  const testimonials = useMemo(() => testimonialsQuery.data?.items ?? [], [testimonialsQuery.data])
  const meta = testimonialsQuery.data?.meta
  const hasNoCachedData = !testimonialsQuery.data

  const openCreateModal = () => {
    setMode('create')
    setEditId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (item: TestimonialMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      name: item.name,
      content: item.content,
      role: item.role ?? '',
      company: item.company ?? '',
      avatarUrl: item.avatarUrl ?? '',
    })
    setModalOpen(true)
  }

  const requestDelete = (item: TestimonialMasterItem) => {
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

  const handleModalSubmit = (values: TestimonialsCreateEditFormValues, selectedAvatarFile: File | null) => {
    const save = async () => {
      let avatarUrl = values.avatarUrl.trim()

      if (selectedAvatarFile) {
        const uploaded = await uploadAvatarMutation.mutateAsync(selectedAvatarFile)
        avatarUrl = uploaded.relativeUrl || uploaded.absoluteUrl
      }

      if (mode === 'create') {
        const payload: TestimonialMasterPayload = {
          name: values.name,
          content: values.content,
          role: values.role || undefined,
          company: values.company || undefined,
          avatarUrl: avatarUrl || undefined,
        }

        createMutation.mutate(payload)
        return
      }

      if (!editId) {
        return
      }

      const payload: TestimonialMasterPayload = {
        name: values.name,
        content: values.content,
        role: values.role ? values.role : null,
        company: values.company ? values.company : null,
        avatarUrl: avatarUrl ? avatarUrl : null,
      }

      updateMutation.mutate({
        itemId: editId,
        payload,
      })
    }

    save().catch((err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to save testimonial.'))
      setToastOpen(true)
    })
  }

  if (testimonialsQuery.isPending && page === 1 && !search) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading testimonials" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading testimonials...</p>
          </div>
        </div>
      </div>
    )
  }

  if (testimonialsQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load testimonials</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(testimonialsQuery.error, 'Unable to load testimonials.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => testimonialsQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
            placeholder="Search by name or content"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-80"
          />

          {/* {search ? (
            <ActionButton size="sm" intent="ghost" onClick={clearSearch}>
              Clear
            </ActionButton>
          ) : null} */}
        </div>

        <div className="flex items-center gap-2">
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/testimonials/reorder')}>
            Reorder Testimonials
          </ActionButton>
          <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
            Add Testimonial
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {testimonialsQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading testimonials" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading testimonials...</p>
                </div>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialsMasterCard
                  key={testimonial.id}
                  mode="manage"
                  testimonial={testimonial}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(testimonial)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No testimonials found. Try creating one or updating the search.
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

      <TestimonialsCreateEditModal
        isOpen={modalOpen}
        mode={mode}
        initialValues={formValues}
        submitting={createMutation.isPending || updateMutation.isPending}
        uploadLoading={uploadAvatarMutation.isPending}
        onClose={() => {
          setModalOpen(false)
        }}
        onSubmit={handleModalSubmit}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemType="testimonial"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
