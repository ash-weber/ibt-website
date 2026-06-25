import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiShuffle, FiLayout } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ActionButton, DeleteConfirmationModal, Dropdown, Loader, Pagination, SearchBox, Toast } from '../../../../component'
import {
  createContactsMasterItem,
  deleteContactsMasterItem,
  getContactsMasterItems,
  updateContactsMasterItem,
} from '../../../../api/contactsMaster'
import type { ContactMasterItem, ContactType } from '../../../../types/contactsMaster'
import { ContactsCreateEditModal } from './components/ContactsCreateEditModal'
import type { ContactsCreateEditFormValues } from './components/ContactsCreateEditModal'

type ApiError = {
  message?: string
}

type ToastVariant = 'success' | 'error'
type Mode = 'create' | 'edit'

const PAGE_LIMIT = 9

const EMPTY_FORM_VALUES: ContactsCreateEditFormValues = {
  type: 'PHONE',
  value: '',
}

const CONTACT_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Phone', value: 'PHONE' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Address', value: 'ADDRESS' },
]

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function getTypeBadge(type: ContactType) {
  if (type === 'PHONE') return 'Phone'
  if (type === 'EMAIL') return 'Email'
  return 'Address'
}

export function ContactsMasterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | ContactType>('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [formValues, setFormValues] = useState<ContactsCreateEditFormValues>(EMPTY_FORM_VALUES)

  const contactsQuery = useQuery({
    queryKey: ['master-contacts', page, PAGE_LIMIT, search, typeFilter],
    queryFn: () =>
      getContactsMasterItems({
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
    mutationFn: createContactsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-contacts'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Contact created successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to create contact.'))
      setToastOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updateContactsMasterItem>[1] }) =>
      updateContactsMasterItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-contacts'] })
      setModalOpen(false)
      setFormValues(EMPTY_FORM_VALUES)
      setToastVariant('success')
      setToastMessage('Contact updated successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to update contact.'))
      setToastOpen(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteContactsMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-contacts'] })
      setToastVariant('success')
      setToastMessage('Contact deleted successfully.')
      setToastOpen(true)
    },
    onError: (err) => {
      setToastVariant('error')
      setToastMessage(getApiErrorMessage(err, 'Failed to delete contact.'))
      setToastOpen(true)
    },
  })

  const contacts = useMemo(() => contactsQuery.data?.items ?? [], [contactsQuery.data])
  const meta = contactsQuery.data?.meta
  const hasNoCachedData = !contactsQuery.data

  const openCreateModal = () => {
    setMode('create')
    setEditId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (item: ContactMasterItem) => {
    setMode('edit')
    setEditId(item.id)
    setFormValues({
      type: item.type,
      value: item.value,
    })
    setModalOpen(true)
  }

  const requestDelete = (item: ContactMasterItem) => {
    setDeleteTarget({ id: item.id, label: item.value })
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

  const handleModalSubmit = (values: ContactsCreateEditFormValues) => {
    const payload = {
      type: values.type,
      value: values.value.trim(),
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

  if (contactsQuery.isPending && page === 1 && !search && !typeFilter) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center gap-3 p-4">
        <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-6 py-5 shadow-[var(--ui-shadow-md)]">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading contacts" />
            <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading contacts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (contactsQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load contacts</p>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(contactsQuery.error, 'Unable to load contacts.')}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => contactsQuery.refetch()} leftIcon={<FiRefreshCw />}>
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
            placeholder="Search contact value"
            defaultValue={search}
            onSearch={handleSearch}
            className="w-full md:w-72"
          />

          <Dropdown
            options={CONTACT_TYPE_OPTIONS}
            value={typeFilter}
            onChange={(value) => {
              setPage(1)
              setTypeFilter((value || '') as '' | ContactType)
            }}
            className="w-full md:w-48"
            placeholder="Filter type"
          />
        </div>

        <div className="flex items-center gap-2">
          <ActionButton size="sm" intent="ghost" leftIcon={<FiLayout />} onClick={() => navigate('/admin/master/contacts/content')}>
            Manage Page Content
          </ActionButton>
          <ActionButton size="sm" intent="ghost" leftIcon={<FiShuffle />} onClick={() => navigate('/admin/master/contacts/reorder')}>
            Reorder Contacts
          </ActionButton>
          <ActionButton size="sm" intent="primary" leftIcon={<FiPlus />} onClick={openCreateModal}>
            Add Contact
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {contactsQuery.isFetching && hasNoCachedData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader size="md" label="Loading contacts" />
                  <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading contacts...</p>
                </div>
              </div>
            </div>
          ) : contacts.length > 0 ? (
            <div className="grid gap-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ui-border)] bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{contact.value}</p>
                    <p className="line-clamp-1 text-xs text-[var(--ui-muted)]">
                      {getTypeBadge(contact.type)} • Order #{contact.order}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <ActionButton size="sm" intent="ghost" onClick={() => openEditModal(contact)}>
                      Edit
                    </ActionButton>
                    <ActionButton
                      size="sm"
                      intent="ghost"
                      loading={deleteMutation.isPending}
                      onClick={() => requestDelete(contact)}
                    >
                      Delete
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-6 text-center text-sm text-[var(--ui-muted)]">
                No contacts found. Try creating one or updating filters.
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

      <ContactsCreateEditModal
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
        itemType="contact"
        itemLabel={deleteTarget?.label}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
