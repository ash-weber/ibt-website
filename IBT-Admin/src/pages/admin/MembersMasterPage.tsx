import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { FiShuffle } from 'react-icons/fi'
import { ActionButton, DeleteConfirmationModal, Loader, Pagination, SearchBox, Toast } from '../../component'
import {
  createMembersMasterItem,
  deleteMembersMasterItem,
  getMembersMasterItems,
  updateMembersMasterItem,
  uploadMemberAvatar,
} from '../../api/membersMaster'
import type { MemberMasterItem, MemberMasterPayload } from '../../types/membersMaster'
import {
  MembersCreateEditModal,
  type MembersCreateEditFormValues,
} from './components/members/MembersCreateEditModal'
import { MembersMasterCard } from './components/members/MembersMasterCard'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: MembersCreateEditFormValues = {
  name: '',
  role: '',
  email: '',
  linkedinUrl: '',
  phone: '',
  avatarUrl: '',
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

export function MembersMasterPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [formValues, setFormValues] = useState<MembersCreateEditFormValues>(EMPTY_FORM_VALUES)

  const membersQuery = useQuery({
    queryKey: ['master-members', page, PAGE_LIMIT, search],
    queryFn: () =>
      getMembersMasterItems({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const createMutation = useMutation({
    mutationFn: createMembersMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-members'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Member created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create member.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: MemberMasterPayload }) =>
      updateMembersMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-members'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Member updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update member.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMembersMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-members'] })
      setToastVariant('success')
      setToastMessage('Member deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete member.'))
      setToastOpen(true)
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadMemberAvatar,
  })

  const members = useMemo(() => membersQuery.data?.items ?? [], [membersQuery.data])
  const meta = membersQuery.data?.meta
  const hasNoCachedData = !membersQuery.data

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

  const openEditModal = useCallback((item: MemberMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      name: item.name,
      role: item.role,
      email: item.email,
      linkedinUrl: item.linkedinUrl || '',
      phone: item.phone,
      avatarUrl: item.avatarUrl,
    })
    setModalOpen(true)
  }, [])

  const requestDelete = useCallback((item: MemberMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.name })
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) {
      return
    }

    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }, [deleteMutation, deleteTarget])

  const handleModalSubmit = async (values: MembersCreateEditFormValues, imageFile: File | null) => {
    try {
      let avatarUrl = values.avatarUrl

      if (imageFile) {
        const uploaded = await uploadAvatarMutation.mutateAsync(imageFile)
        // Prefer relativeUrl for local files, absoluteUrl for Cloudinary
        avatarUrl = uploaded.relativeUrl || uploaded.absoluteUrl
      }

      const payload: MemberMasterPayload = {
        name: values.name.trim(),
        role: values.role.trim(),
        email: values.email.trim(),
        linkedinUrl: values.linkedinUrl.trim() || undefined,
        phone: values.phone.trim(),
        avatarUrl: avatarUrl || undefined,
      }

      if (mode === 'create') {
        createMutation.mutate(payload)
      } else if (editId) {
        updateMutation.mutate({ itemId: editId, payload })
      }
    } catch (err) {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to save member.'))
      setToastOpen(true)
    }
  }

  if (membersQuery.isPending && page === 1 && !search) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading members" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading members...</p>
          </div>
        </div>
      </div>
    )
  }

  if (membersQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load members</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(membersQuery.error, 'Unable to load members.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => membersQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
            placeholder="Search by name, role, or email"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-80"
          />
        </div>

        <div className="flex items-center gap-2">
          <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
            Add Member
          </ActionButton>
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/members/reorder')}>
            Reorder Members
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {membersQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading members" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading members...</p>
                </div>
              </div>
            </div>
          ) : members.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => (
                <MembersMasterCard
                  key={member.id}
                  member={member}
                  onEdit={openEditModal}
                  onDelete={() => requestDelete(member)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No members found. Try creating one or updating the search.
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

      <MembersCreateEditModal
        isOpen={modalOpen}
        mode={mode}
        initialValues={formValues}
        submitting={createMutation.isPending || updateMutation.isPending}
        uploadLoading={uploadAvatarMutation.isPending}
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
        itemType="member"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
