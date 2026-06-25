import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiBriefcase, FiRefreshCw, FiExternalLink, FiSearch } from 'react-icons/fi'
import { getApplications, updateApplicationStatus, deleteApplication } from '../../../../api/applicationsMaster'
import { ActionButton, Dropdown, Input, Toast, Loader, Pagination } from '../../../../component'

const TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Job', value: 'JOB' },
]

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Reviewing', value: 'REVIEWING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
]

export function InternshipApplicationsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' as 'success' | 'error' })

  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const statusMutation = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setToast({ open: true, message: 'Status updated successfully', variant: 'success' })
    },
    onError: (err: any) => {
      setToast({ open: true, message: err.message || 'Failed to update status', variant: 'error' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setToast({ open: true, message: 'Application deleted', variant: 'success' })
    },
    onError: (err: any) => {
      setToast({ open: true, message: err.message || 'Failed to delete application', variant: 'error' })
    }
  })

  const handleStatusChange = (id: string, newStatus: string) => {
    statusMutation.mutate({ id, status: newStatus })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredApps = applicationsQuery.data?.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !typeFilter || app.applicationType === typeFilter
    const matchesStatus = !statusFilter || app.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  }) || []

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage)
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full flex-col overflow-hidden">
      <Toast 
        open={toast.open} 
        onClose={() => setToast(prev => ({ ...prev, open: false }))} 
        message={toast.message} 
        variant={toast.variant} 
      />

      {/* Sticky Header with Title and Search/Filters */}
      <div className="sticky top-0 z-10 border-b border-[var(--ui-border)] bg-white px-4 py-3 shadow-[var(--ui-shadow-sm)] md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--ui-text)] flex items-center gap-2">
              <FiBriefcase className="text-[var(--ui-primary)]" />
              Applications
            </h1>
            <p className="text-xs text-[var(--ui-muted)]">Manage internship and job applications</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Input
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              startIcon={<FiSearch />}
              className="w-64"
            />

            <Dropdown
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value)
                setCurrentPage(1)
              }}
            />

            <Dropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            />

            <ActionButton
              intent="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Clear
            </ActionButton>

            <ActionButton
              intent="secondary"
              size="sm"
              onClick={() => applicationsQuery.refetch()}
              leftIcon={<FiRefreshCw />}
            >
              Refresh
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {applicationsQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center bg-white">
            <Loader size="lg" label="Loading applications..." />
          </div>
        ) : applicationsQuery.isError ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="rounded-lg bg-red-50 p-6 text-center text-red-600 border border-red-100 max-w-md">
              Failed to load applications. Please try again.
            </div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-1 items-center justify-center border border-dashed border-[var(--ui-border)] bg-white text-center text-sm text-[var(--ui-muted)]">
            <div className="p-12 text-center">
              <FiBriefcase className="mx-auto h-12 w-12 text-[var(--ui-muted)]" />
              <h3 className="mt-4 text-base font-semibold text-[var(--ui-text)]">No applications found</h3>
              <p className="mt-1 text-xs text-[var(--ui-muted)]">We couldn't find any applications matching your criteria.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto border border-[var(--ui-border)] bg-white shadow-[var(--ui-shadow-sm)]">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 border-b border-[var(--ui-border)] bg-[var(--ui-surface-muted)] z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Applicant</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Role & Skills</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Resume</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="border-b border-[var(--ui-border)] last:border-b-0 hover:bg-[var(--ui-surface-muted)]/40">
                    <td className="px-4 py-3 align-top">
                       <div className="flex flex-col">
                         <span className="font-semibold text-sm text-[var(--ui-text)]">{app.name}</span>
                         <span className="text-xs text-[var(--ui-muted)]">{app.email}</span>
                         <span className="text-xs text-[var(--ui-muted)] mt-1">{app.phone}</span>
                       </div>
                     </td>
                     <td className="px-4 py-3 align-top">
                       <div className="flex flex-col max-w-[200px]">
                         <span className="text-sm font-semibold text-[var(--ui-text)] truncate">{app.jobType}</span>
                         <span className="text-xs text-[var(--ui-muted)] truncate" title={app.skills}>{app.skills}</span>
                       </div>
                     </td>
                     <td className="px-4 py-3 align-top">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                         app.applicationType === 'INTERNSHIP' 
                           ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                           : 'bg-purple-50 text-purple-700 border border-purple-200'
                       }`}>
                         {app.applicationType.toLowerCase()}
                       </span>
                     </td>
                     <td className="px-4 py-3 align-top">
                       <select 
                         value={app.status}
                         onChange={(e) => handleStatusChange(app.id, e.target.value)}
                         className={`text-xs font-semibold rounded-md px-2 py-1 border border-[var(--ui-border)] bg-white shadow-sm focus:border-[var(--ui-primary)] outline-none ${
                           app.status === 'PENDING' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 
                           app.status === 'REVIEWING' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                           app.status === 'ACCEPTED' ? 'text-green-700 bg-green-50 border-green-200' :
                           'text-red-700 bg-red-50 border-red-200'
                         }`}
                       >
                         <option value="PENDING">Pending</option>
                         <option value="REVIEWING">Reviewing</option>
                         <option value="ACCEPTED">Accepted</option>
                         <option value="REJECTED">Rejected</option>
                       </select>
                     </td>
                     <td className="px-4 py-3 align-top">
                       {app.resumeUrl ? (
                         <a 
                           href={app.resumeUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="inline-flex items-center gap-1 text-xs text-[var(--ui-primary)] hover:underline font-semibold"
                         >
                           <FiExternalLink />
                           View
                         </a>
                       ) : (
                         <span className="text-xs text-[var(--ui-muted)] italic">No Resume</span>
                       )}
                     </td>
                     <td className="px-4 py-3 align-top text-right">
                       <ActionButton
                         type="button"
                         intent="delete"
                         size="sm"
                         onClick={() => handleDelete(app.id)}
                         title="Delete Application"
                       />
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>

       {/* Sticky Pagination */}
       <div className="sticky bottom-0 z-10 bg-white border-t border-[var(--ui-border)]">
         {totalPages > 1 ? (
           <Pagination
             page={currentPage}
             totalPages={totalPages}
             hasPrev={currentPage > 1}
             hasNext={currentPage < totalPages}
             onPageChange={(nextPage) => setCurrentPage(nextPage)}
           />
         ) : null}
       </div>
     </div>
  )
}
