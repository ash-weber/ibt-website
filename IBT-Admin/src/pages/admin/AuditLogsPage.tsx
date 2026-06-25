import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiClock, FiRefreshCw } from 'react-icons/fi'
import { ActionButton, Dropdown, Input, Loader, Modal, Pagination } from '../../component'
import { getAuditLogById, getAuditLogs } from '../../api/auditLogs'
import type { AuditAction } from '../../types/auditLogs'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { ActionBadge } from './components/audit/ActionBadge'
import { AuditLogDetailContent } from './components/audit/AuditLogDetailContent'

type ApiError = {
  message?: string
}

const PAGE_LIMIT = 20

const ACTION_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
  { label: 'Login', value: 'LOGIN' },
]

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message ?? fallback
}

function formatDateTime(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function getDateRange(startDate: string, endDate: string) {
  const from = startDate ? new Date(`${startDate}T00:00:00`) : undefined
  const to = endDate ? new Date(`${endDate}T23:59:59.999`) : undefined

  return {
    from: from && !Number.isNaN(from.getTime()) ? from.toISOString() : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to.toISOString() : undefined,
  }
}

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [action, setAction] = useState<'' | AuditAction>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchInput, 450)

  const { from, to } = useMemo(() => getDateRange(startDate, endDate), [startDate, endDate])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const auditLogsQuery = useQuery({
    queryKey: ['audit-logs', page, PAGE_LIMIT, debouncedSearch, action, from, to],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch.trim() || undefined,
        action: action || undefined,
        from,
        to,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  })

  const detailsQuery = useQuery({
    queryKey: ['audit-log-details', selectedLogId],
    queryFn: () => getAuditLogById(selectedLogId as string),
    enabled: Boolean(selectedLogId),
  })

  const logs = useMemo(() => auditLogsQuery.data?.items ?? [], [auditLogsQuery.data])
  const meta = auditLogsQuery.data?.meta
  const hasNoCachedData = !auditLogsQuery.data

  const clearFilters = () => {
    setPage(1)
    setSearchInput('')
    setAction('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full flex-col overflow-hidden">
      <div className="sticky z-10 border-b border-[var(--ui-border)] bg-white px-4 py-3 shadow-[var(--ui-shadow-sm)] md:px-6">
        <div className="flex items-center justify-between">
            <div className='flex justify-start items-start gap-4 flex-wrap'>
                <Input
                    placeholder="Search by entity, id, user"
                    value={searchInput}
                    onChange={(event) => {
                    setSearchInput(event.target.value)
                    }}
                    className='w-80'
                />
            </div>

          <div className="flex items-center gap-3 justify-end flex-wrap">
             <Dropdown
            options={ACTION_OPTIONS}
            value={action}
            onChange={(value) => {
              setPage(1)
              setAction(value as '' | AuditAction)
            }}
          />

          <Input
            type="date"
            value={startDate}
            onChange={(event) => {
              setPage(1)
              setStartDate(event.target.value)
            }}
            // helperText='start date'
          />

          <Input
            type="date"
            value={endDate}
            onChange={(event) => {
              setPage(1)
              setEndDate(event.target.value)
            }}
            // helperText='end date'
          />
            <ActionButton size="sm" intent="ghost" onClick={clearFilters}>
              Clear
            </ActionButton>
          </div>
            
          
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {auditLogsQuery.isFetching && hasNoCachedData ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-[var(--ui-border)] bg-white">
            <div className="flex items-center gap-3 rounded-lg border border-[var(--ui-border)] bg-white px-5 py-4 shadow-[var(--ui-shadow-sm)]">
              <Loader size="md" label="Loading audit logs" />
              <p className="text-sm font-semibold text-[var(--ui-muted)]">Loading audit logs...</p>
            </div>
          </div>
        ) : auditLogsQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xl rounded-[var(--ui-radius-lg)] border border-red-200 bg-red-50 p-8 text-center shadow-[var(--ui-shadow-md)]">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
                <FiAlertTriangle />
              </div>
              <p className="text-base font-semibold text-red-800">Could not load audit logs</p>
              <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(auditLogsQuery.error, 'Unable to load audit logs.')}</p>
              <div className="mt-5 flex justify-center">
                <ActionButton intent="secondary" onClick={() => auditLogsQuery.refetch()} leftIcon={<FiRefreshCw />}>
                  Retry
                </ActionButton>
              </div>
            </div>
          </div>
        ) : logs.length > 0 ? (
          <div className="flex-1 overflow-auto border border-[var(--ui-border)] bg-white shadow-[var(--ui-shadow-sm)]">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 border-b border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Action</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Entity</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">User</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Timestamp</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--ui-border)] last:border-b-0 hover:bg-[var(--ui-surface-muted)]/40">
                    <td className="px-4 py-3 align-top"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-sm font-semibold text-[var(--ui-text)]">{log.entity}</p>
                      <p className="text-xs text-[var(--ui-muted)]">ID: {log.entityId}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-sm text-[var(--ui-text)]">{log.user?.name ?? 'System'}</p>
                      <p className="text-xs text-[var(--ui-muted)]">{log.user?.email ?? 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="inline-flex items-center gap-1 text-xs text-[var(--ui-muted)]">
                        <FiClock size={12} />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ActionButton size="sm" intent="ghost" onClick={() => setSelectedLogId(log.id)}>
                        View
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center border border-dashed border-[var(--ui-border)] bg-white text-center text-sm text-[var(--ui-muted)]">
            No audit logs found for the current filters.
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10">
        {meta ? (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            hasPrev={meta.hasPrev}
            hasNext={meta.hasNext}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(selectedLogId)}
        title="Audit Log Details"
        onClose={() => setSelectedLogId(null)}
        size="lg"
      >
        {detailsQuery.isPending ? (
          <div className="grid min-h-[220px] place-items-center">
            <Loader size="lg" label="Loading log details" />
          </div>
        ) : detailsQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {getApiErrorMessage(detailsQuery.error, 'Unable to load audit log details.')}
          </div>
        ) : detailsQuery.data ? (
          <AuditLogDetailContent item={detailsQuery.data} />
        ) : (
          <div className="rounded-lg border border-[var(--ui-border)] p-4 text-sm text-[var(--ui-muted)]">No details available.</div>
        )}
      </Modal>
    </div>
  )
}
