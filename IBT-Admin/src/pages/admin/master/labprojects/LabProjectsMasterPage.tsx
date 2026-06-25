import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle, FiLayout } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Dropdown, Loader, Pagination, SearchBox, Toast } from '../../../../component'
import {
  createLabProjectMasterItem,
  deleteLabProjectMasterItem,
  getLabProjectsMasterItems,
  updateLabProjectMasterItem,
  uploadLabProjectGalleryImages,
  uploadLabProjectImage,
} from '../../../../api/labProjectsMaster'
import type { LabProjectMasterItem, LabProjectMasterPayload, LabProjectStatus } from '../../../../types/labProjectsMaster'
import { LabProjectsMasterCard } from './compoenets/LabProjectsMasterCard'
import { LabProjectsCreateEditModal } from './compoenets/LabProjectsCreateEditModal'
import type { LabProjectsCreateEditFormValues } from './compoenets/LabProjectsCreateEditModal'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: LabProjectsCreateEditFormValues = {
  title: '',
  slug: '',
  description: '',
  content: '',
  imageUrl: '',
  gallery: [],
  tags: '',
  techStack: '',
  projectUrl: '',
  repoUrl: '',
  status: 'ONGOING',
  featured: false,
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function parseCsv(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
]

const FEATURED_FILTER_OPTIONS = [
  { label: 'All Projects', value: '' },
  { label: 'Featured Only', value: 'true' },
  { label: 'Not Featured', value: 'false' },
]

export function LabProjectsMasterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | LabProjectStatus>('')
  const [featuredFilter, setFeaturedFilter] = useState<'' | 'true' | 'false'>('')

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [formValues, setFormValues] = useState<LabProjectsCreateEditFormValues>(EMPTY_FORM_VALUES)
  const labsQuery = useQuery({
    queryKey: ['master-lab-projects', page, PAGE_LIMIT, search, statusFilter, featuredFilter],
    queryFn: () =>
      getLabProjectsMasterItems({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        status: statusFilter || undefined,
        featured: featuredFilter === '' ? undefined : featuredFilter === 'true',
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createLabProjectMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-lab-projects'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Lab project created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create lab project.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updateLabProjectMasterItem>[1] }) =>
      updateLabProjectMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-lab-projects'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Lab project updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update lab project.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLabProjectMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-lab-projects'] })
      setToastVariant('success')
      setToastMessage('Lab project deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete lab project.'))
      setToastOpen(true)
    },
  })

  const uploadImageMutation = useMutation({
    mutationFn: uploadLabProjectImage,
  })

  const uploadGalleryMutation = useMutation({
    mutationFn: uploadLabProjectGalleryImages,
  })

  const projects = useMemo(() => labsQuery.data?.items ?? [], [labsQuery.data])
  const meta = labsQuery.data?.meta
  const hasNoCachedData = !labsQuery.data

  const handleSearch = useCallback((value: string) => {
    setPage(1)
    setSearch(value)
  }, [])

  const openCreateModal = useCallback(() => {
    setMode('create')
    setEditId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((item: LabProjectMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      title: item.title,
      slug: item.slug,
      description: item.description,
      content: item.content ?? '',
      imageUrl: item.imageUrl ?? '',
      gallery: item.gallery,
      tags: item.tags.join(', '),
      techStack: item.techStack.join(', '),
      projectUrl: item.projectUrl ?? '',
      repoUrl: item.repoUrl ?? '',
      status: item.status,
      featured: item.featured,
    })
    setModalOpen(true)
  }, [])

  const requestDelete = useCallback((item: LabProjectMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.title })
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) {
      return
    }

    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }, [deleteMutation, deleteTarget])

  const handleModalSubmit = async (
    values: LabProjectsCreateEditFormValues,
    imageFile: File | null,
    galleryFiles: File[]
  ) => {
    try {
      let imageUrl = values.imageUrl
      let galleryUrls = values.gallery

      if (imageFile) {
        const uploaded = await uploadImageMutation.mutateAsync(imageFile)
        imageUrl = uploaded.relativeUrl || uploaded.absoluteUrl
      }

      if (galleryFiles.length > 0) {
        const uploadedGallery = await uploadGalleryMutation.mutateAsync(galleryFiles)
        const newGalleryUrls = uploadedGallery.map((file) => file.relativeUrl || file.absoluteUrl)
        galleryUrls = [...galleryUrls, ...newGalleryUrls]
      }

      const payload: LabProjectMasterPayload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        content: values.content.trim() || null,
        imageUrl: imageUrl || null,
        gallery: [...new Set(galleryUrls.map((url) => url.trim()).filter(Boolean))],
        tags: parseCsv(values.tags),
        techStack: parseCsv(values.techStack),
        projectUrl: values.projectUrl.trim() || null,
        repoUrl: values.repoUrl.trim() || null,
        status: values.status,
        featured: values.featured,
      }

      if (mode === 'create') {
        createMutation.mutate(payload)
      } else if (editId) {
        updateMutation.mutate({ itemId: editId, payload })
      }
    } catch (err) {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to save lab project.'))
      setToastOpen(true)
    }
  }

  if (labsQuery.isPending && page === 1 && !search && !statusFilter && !featuredFilter) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading lab projects" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading lab projects...</p>
          </div>
        </div>
      </div>
    )
  }

  if (labsQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load lab projects</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(labsQuery.error, 'Unable to load lab projects.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => labsQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
            placeholder="Search title, description, or content"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-80"
          />

          <Dropdown
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(value) => {
              setPage(1)
              setStatusFilter((value || '') as '' | LabProjectStatus)
            }}
            className="w-full md:w-44"
            placeholder="Filter status"
          />

          <Dropdown
            options={FEATURED_FILTER_OPTIONS}
            value={featuredFilter}
            onChange={(value) => {
              setPage(1)
              setFeaturedFilter((value || '') as '' | 'true' | 'false')
            }}
            className="w-full md:w-44"
            placeholder="Filter featured"
          />
        </div>

        <div className='flex gap-3'>
          <ActionButton size="sm" intent="ghost" leftIcon={<FiLayout />} onClick={() => navigate('/admin/master/lab-projects/content')}>
          Manage Page Content
        </ActionButton>
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/lab-projects/reorder')}>
          Reorder Lab Projects
        </ActionButton>
        <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
          Add Lab Project
        </ActionButton>  
        </div>    
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {labsQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading lab projects" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading lab projects...</p>
                </div>
              </div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <LabProjectsMasterCard
                  key={project.id}
                  mode="manage"
                  project={project}
                  deleting={deleteMutation.isPending}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(project)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No lab projects found. Try creating one or changing filters.
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

      <LabProjectsCreateEditModal
        isOpen={modalOpen}
        mode={mode}
        initialValues={formValues}
        submitting={createMutation.isPending || updateMutation.isPending}
        uploadLoading={uploadImageMutation.isPending || uploadGalleryMutation.isPending}
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
        itemType="lab project"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
