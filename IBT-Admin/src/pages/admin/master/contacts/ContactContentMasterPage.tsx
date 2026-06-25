import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiRefreshCw, FiSave, FiSettings, FiMapPin, FiArrowUp, FiArrowDown, FiPlus, FiTrash2 } from 'react-icons/fi'
import { getSettings, saveSettings } from '../../../../api/settings'
import { ActionButton, Input, Loader, Toast } from '../../../../component'
import { useSocketSettings } from '../../../../providers/SocketSettingsProvider'
import { contactSettingsSchema, type ContactSettingsSchema } from '../../../../features/settings/validation'
import { SETTINGS_KEYS, type SettingEntity, type SettingsFormValues } from '../../../../types/settings'

type FieldErrors = Partial<Record<keyof ContactSettingsSchema | string, string>>

type ApiError = {
  message?: string
}

const SETTINGS_QUERY_KEY = ['settings']

const DEFAULT_VALUES: any = {
  contactBranches: [],
}

function settingsToForm(settings: SettingEntity[]): any {
  const map = new Map(settings.map((item) => [item.key, item.value]))

  return {

    // Contact – Dynamic Branches List
    contactBranches: (() => {
      const val = map.get(SETTINGS_KEYS.CONTACT_BRANCHES)
      if (Array.isArray(val)) return val
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch {
          // ignore
        }
      }
      return []
    })(),
  }
}

function mapValidationErrors(values: any) {
  const result = contactSettingsSchema.safeParse(values)

  if (result.success) {
    return { valid: true as const, errors: {} as FieldErrors }
  }

  const nextErrors: FieldErrors = {}

  for (const issue of result.error.issues) {
    const path = issue.path
    if (path.length === 1) {
      const key = path[0] as string
      if (!nextErrors[key]) {
        nextErrors[key] = issue.message
      }
    } else if (path.length > 1) {
      const key = path.join('.')
      if (!nextErrors[key]) {
        nextErrors[key] = issue.message
      }
    }
  }

  return {
    valid: false as const,
    errors: nextErrors,
  }
}

export function ContactContentMasterPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<any>(DEFAULT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')

  const lastRealtimeUpdateRef = useRef<string | null>(null)

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
  })

  useEffect(() => {
    if (!data) {
      return
    }
    setValues(settingsToForm(data))
  }, [data])

  useEffect(() => {
    if (!connection.lastUpdateAt || lastRealtimeUpdateRef.current === connection.lastUpdateAt) {
      return
    }
    lastRealtimeUpdateRef.current = connection.lastUpdateAt
    void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
  }, [connection.lastUpdateAt, queryClient])

  const mutation = useMutation({
    mutationFn: (formValues: any) =>
      saveSettings({
        values: formValues,
        currentSettings: data ?? [],
      }),
    onSuccess: () => {
      setToastVariant('success')
      setToastMessage('Contact page content updated successfully.')
      setToastOpen(true)
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
    },
    onError: (err) => {
      const axiosError = err as AxiosError<ApiError>
      setToastVariant('error')
      setToastMessage(axiosError.response?.data?.message ?? 'Failed to update content.')
      setToastOpen(true)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validation = mapValidationErrors(values)

    if (!validation.valid) {
      setErrors(validation.errors)
      setToastVariant('error')
      setToastMessage('Please fix the errors in the form before saving.')
      setToastOpen(true)
      return
    }

    setErrors({})
    mutation.mutate(values)
  }

  const handleReset = () => {
    if (data) {
      setValues(settingsToForm(data))
      setErrors({})
    }
  }

  const handleAddBranch = () => {
    const newBranch = {
      id: `branch-${Date.now()}`,
      title: 'New Command Center Hub',
      address: '',
      mapLink: '',
      latLong: '11.0168° N, 76.9558° E',
      markerX: 50,
      markerY: 50,
    }
    setValue('contactBranches', [...(values.contactBranches || []), newBranch])
  }

  const handleRemoveBranch = (id: string) => {
    setValue('contactBranches', (values.contactBranches || []).filter((b: any) => b.id !== id))
  }

  const handleUpdateBranchField = (id: string, field: string, value: any) => {
    setValue('contactBranches', (values.contactBranches || []).map((b: any) => {
      if (b.id === id) {
        return { ...b, [field]: value }
      }
      return b
    }))
  }

  const handleMoveBranch = (index: number, direction: 'up' | 'down') => {
    const list = [...(values.contactBranches || [])]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return
    const temp = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = temp
    setValue('contactBranches', list)
  }

  const setValue = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((prev: any) => ({ ...prev, [key]: value }))
  }

  const getBranchError = (idx: number, field: string) => {
    return (errors as any)[`contactBranches.${idx}.${field}`]
  }

  if (isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <Loader size="lg" label="Loading Contact Page content..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
          <FiSettings className="mx-auto mb-4 text-4xl text-red-600" />
          <p className="text-lg font-bold text-red-800">Could not load content</p>
          <p className="mt-1 text-sm text-red-700">{(error as any)?.message ?? 'An error occurred.'}</p>
          <ActionButton className="mt-6" intent="secondary" onClick={() => refetch()} leftIcon={<FiRefreshCw />}>
            Retry
          </ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col bg-slate-50/50">
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Success' : 'Error'}
        onClose={() => setToastOpen(false)}
      />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col pb-20">
        {/* Sticky Toolbar */}
        <div className="sticky top-[4.5rem] z-20 flex items-center justify-between border-b border-[var(--ui-border)] bg-white/95 px-4 py-3 backdrop-blur-md md:px-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--ui-text)]">Manage Page Content: Contact</h1>
            <p className="text-xs text-[var(--ui-muted)]">Configure interactive coordinate tracking and global hub locations</p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton type="button" intent="ghost" size="sm" onClick={handleReset} leftIcon={<FiRefreshCw />}>
              Reset
            </ActionButton>
            <ActionButton type="submit" intent="primary" size="sm" loading={mutation.isPending} leftIcon={<FiSave />}>
              Save Changes
            </ActionButton>
          </div>
        </div>



        <div className="mx-auto w-full max-w-5xl p-4 space-y-8 md:p-8">
          {/* Branches and Coordinate Settings */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4 mb-4">
                <div className="flex items-center gap-2 text-[var(--ui-primary)]">
                  <FiMapPin className="text-xl animate-pulse" />
                  <h2 className="text-base font-bold text-[var(--ui-text)]">Command Center Locations & Map Coordinates</h2>
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  size="sm"
                  onClick={handleAddBranch}
                  leftIcon={<FiPlus />}
                >
                  Add Hub Location
                </ActionButton>
              </div>

              {(values.contactBranches || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
                  <FiMapPin className="mx-auto mb-4 text-4xl text-slate-400" />
                  <h3 className="text-base font-extrabold text-slate-700">No Branch Hubs configured</h3>
                  <p className="mt-1 text-xs text-slate-500">Add a new dynamic hub coordinates and map embed parameters below.</p>
                  <ActionButton
                    type="button"
                    intent="primary"
                    size="sm"
                    className="mt-4"
                    onClick={handleAddBranch}
                    leftIcon={<FiPlus />}
                  >
                    Add First Hub Location
                  </ActionButton>
                </div>
              ) : (
                <div className="space-y-6">
                  {(values.contactBranches || []).map((branch: any, idx: number) => (
                    <div
                      key={branch.id}
                      className="group relative rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-6"
                    >
                      {/* Hub Header with controls */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 font-mono font-bold text-xs text-slate-600">
                            #{idx + 1}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Hub Command Center</span>
                            <h3 className="text-sm font-extrabold text-slate-900">{branch.title || 'Untitled Hub'}</h3>
                          </div>
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBranch(idx, 'up')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Hub Up"
                          >
                            <FiArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (values.contactBranches || []).length - 1}
                            onClick={() => handleMoveBranch(idx, 'down')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Hub Down"
                          >
                            <FiArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBranch(branch.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Remove Hub Location"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inputs Grid */}
                      <div className="space-y-6">
                        <Input
                          label="Branch Title"
                          value={branch.title}
                          onChange={(e) => handleUpdateBranchField(branch.id, 'title', e.target.value)}
                          error={getBranchError(idx, 'title')}
                          placeholder="e.g. Coimbatore Headquarters"
                        />
                      </div>

                      <Input
                        label="Branch Address"
                        value={branch.address}
                        onChange={(e) => handleUpdateBranchField(branch.id, 'address', e.target.value)}
                        error={getBranchError(idx, 'address')}
                        placeholder="e.g. IBT Tower, 45, Residency Road, Coimbatore, Tamil Nadu, 641018"
                      />

                      <Input
                        label="Google Maps Embed URL"
                        value={branch.mapLink}
                        onChange={(e) => handleUpdateBranchField(branch.id, 'mapLink', e.target.value)}
                        error={getBranchError(idx, 'mapLink')}
                        placeholder="https://www.google.com/maps/embed..."
                      />

                      {/* Alignment Blueprint Coordinates */}

                    </div>
                  ))}

                  {/* Add branch hub button at the bottom */}
                  <div className="flex justify-center pt-2">
                    <ActionButton
                      type="button"
                      intent="ghost"
                      size="sm"
                      onClick={handleAddBranch}
                      leftIcon={<FiPlus />}
                    >
                      Add Another Hub Location
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>
        </div>
      </form>
    </div>
  )
}
