import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { ActionButton, DeleteConfirmationModal, Dropdown, Input, Loader, Pagination, SearchBox, Toast } from '../../component'
import { deleteBlogsMasterItem, getBlogsMasterItems } from '../../api/blogsMaster'
import type { BlogMasterItem, BlogStatus } from '../../types/blogsMaster'
import { BlogsMasterCard } from './components/blogs/BlogsMasterCard'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'

const PAGE_LIMIT = 9

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
]

const FEATURED_FILTER_OPTIONS = [
  { label: 'All Blogs', value: '' },
  { label: 'Featured Only', value: 'true' },
  { label: 'Not Featured', value: 'false' },
]

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function BlogsMasterPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | BlogStatus>('')
  const [featuredFilter, setFeaturedFilter] = useState<'' | 'true' | 'false'>('')

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  // Receive navigation state like toast messages from form page
  useEffect(() => {
    if (state?.toastMessage) {
      setToastVariant(state.toastVariant ?? 'success')
      setToastMessage(state.toastMessage)
      setToastOpen(true)

      // Clear state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title)
    }
  }, [state])

  const blogsQuery = useQuery({
    queryKey: ['master-blogs', page, PAGE_LIMIT, search, categoryFilter, statusFilter, featuredFilter],
    queryFn: () =>
      getBlogsMasterItems({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        featured: featuredFilter === '' ? undefined : featuredFilter === 'true',
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBlogsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-blogs'] })
      setToastVariant('success')
      setToastMessage('Blog deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete blog.'))
      setToastOpen(true)
    },
  })

  const blogs = useMemo(() => blogsQuery.data?.items ?? [], [blogsQuery.data])
  const meta = blogsQuery.data?.meta
  const hasNoCachedData = !blogsQuery.data

  const openCreatePage = () => {
    navigate('/admin/master/blogs/create')
  }

  const openEditPage = (item: BlogMasterItem) => {
    navigate(`/admin/master/blogs/${item.id}/edit`, { state: { blog: item } })
  }

  const requestDelete = (item: BlogMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.title })
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

  if (blogsQuery.isPending && page === 1 && !search && !categoryFilter && !statusFilter && !featuredFilter) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading blogs" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading blogs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (blogsQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load blogs</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(blogsQuery.error, 'Unable to load blogs.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => blogsQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
            placeholder="Search title, content, category"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-72"
          />
          <Input
            placeholder="Filter category"
            value={categoryFilter}
            onChange={(event) => {
              setPage(1)
              setCategoryFilter(event.target.value)
            }}
            className="w-full md:w-48"
          />
          <Dropdown
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(value) => {
              setPage(1)
              setStatusFilter((value || '') as '' | BlogStatus)
            }}
            className="w-full md:w-40"
            placeholder="Filter status"
          />
          <Dropdown
            options={FEATURED_FILTER_OPTIONS}
            value={featuredFilter}
            onChange={(value) => {
              setPage(1)
              setFeaturedFilter((value || '') as '' | 'true' | 'false')
            }}
            className="w-full md:w-40"
            placeholder="Filter featured"
          />
        </div>

        <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreatePage}>
          Add Blog
        </ActionButton>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {blogsQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading blogs" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading blogs...</p>
                </div>
              </div>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <BlogsMasterCard
                  key={blog.id}
                  blog={blog}
                  onEdit={openEditPage}
                  onDelete={() => requestDelete(blog)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No blogs found. Try creating one or updating filters.
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

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemType="blog"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
