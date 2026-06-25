import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiLayout, FiPlus, FiRefreshCw, FiSave, FiSettings, FiTrash2, FiBriefcase } from 'react-icons/fi'
import { getSettings, saveSettings, uploadServicesImage } from '../../../../api/settings'
import { ActionButton, Input, Loader, Toast } from '../../../../component'
import { ImageUploadField } from '../../components/ImageUploadField'
import { useSocketSettings } from '../../../../providers/SocketSettingsProvider'
import { settingsSchema, type SettingsSchema } from '../../../../features/settings/validation'
import { SETTINGS_KEYS, type SettingEntity, type SettingsFormValues } from '../../../../types/settings'

type FieldErrors = Partial<Record<keyof SettingsSchema, string>>

type ApiError = {
  message?: string
}

const SETTINGS_QUERY_KEY = ['settings']

const DEFAULT_VALUES: any = {
  homeServicesTitle: 'Solutions That Drive Growth',
  homeServicesBadge: 'OUR SERVICES',
  homeRecentWorkTitle: 'Some Of Our Recent Work',
  homeRecentWorkBadge: 'FEATURED PROJECTS',
  homeRecentWorkItems: [
    {
      id: '1',
      title: 'Journey Analytics',
      description: 'Analytics Platform',
      category: 'Web Application',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100',
    },
    {
      id: '2',
      title: 'TechCoach',
      description: 'Learning Management System',
      category: 'Web Application',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100',
    },
    {
      id: '3',
      title: 'MultipliersKart',
      description: 'E-commerce Platform',
      category: 'Web Application',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100',
    },
    {
      id: '4',
      title: 'FIM',
      description: 'Finance Management System',
      category: 'ERP Solution',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    }
  ]
}

function settingsToForm(settings: SettingEntity[]): any {
  const map = new Map(settings.map((item) => [item.key, item.value]))

  const readString = (key: keyof typeof SETTINGS_KEYS, fallback: string) => {
    const value = map.get(SETTINGS_KEYS[key])
    return typeof value === 'string' ? value : fallback
  }

  return {
    homeServicesTitle: readString('HOME_SERVICES_TITLE', DEFAULT_VALUES.homeServicesTitle),
    homeServicesBadge: readString('HOME_SERVICES_BADGE', DEFAULT_VALUES.homeServicesBadge),
    homeRecentWorkTitle: readString('HOME_RECENT_WORK_TITLE', DEFAULT_VALUES.homeRecentWorkTitle),
    homeRecentWorkBadge: readString('HOME_RECENT_WORK_BADGE', DEFAULT_VALUES.homeRecentWorkBadge),
    homeRecentWorkItems: (() => {
      const val = map.get(SETTINGS_KEYS.HOME_RECENT_WORK_ITEMS)
      if (Array.isArray(val)) return val
      if (typeof val === 'string' && val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed
        } catch { }
      }
      return DEFAULT_VALUES.homeRecentWorkItems
    })(),
  }
}

const homeContentSchema = settingsSchema.pick({
  homeServicesTitle: true,
  homeServicesBadge: true,
  homeRecentWorkTitle: true,
  homeRecentWorkBadge: true,
  homeRecentWorkItems: true,
})

function mapValidationErrors(values: any) {
  const result = homeContentSchema.safeParse(values)

  if (result.success) {
    return { valid: true as const, errors: {} as FieldErrors }
  }

  console.error('[HomeContentMasterPage] Validation failed:', result.error.format())

  const flattened = result.error.flatten().fieldErrors as Record<string, string[] | undefined>
  const nextErrors: FieldErrors = {}

  for (const key of Object.keys(flattened) as Array<keyof SettingsSchema>) {
    const message = flattened[key]?.[0]
    if (message) {
      nextErrors[key] = message
    }
  }

  return {
    valid: false as const,
    errors: nextErrors,
  }
}

export function HomeContentMasterPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<SettingsFormValues>(DEFAULT_VALUES)
  const [_errors, setErrors] = useState<FieldErrors>({})
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const lastRealtimeUpdateRef = useRef<string | null>(null)

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
  })

  useEffect(() => {
    if (!data) return
    setValues(settingsToForm(data))
  }, [data])

  useEffect(() => {
    if (!connection.lastUpdateAt || lastRealtimeUpdateRef.current === connection.lastUpdateAt) return
    lastRealtimeUpdateRef.current = connection.lastUpdateAt
    void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
  }, [connection.lastUpdateAt, queryClient])

  const mutation = useMutation({
    mutationFn: (formValues: SettingsFormValues) =>
      saveSettings({
        values: formValues,
        currentSettings: data ?? [],
      }),
    onSuccess: () => {
      setToastVariant('success')
      setToastMessage('Home content updated successfully.')
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
      setToastMessage('Please fix errors in the form.')
      setToastOpen(true)
      return
    }
    setErrors({})
    mutation.mutate(values)
  }

  const setValue = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleProjectImageChange = async (idx: number, file: File | null) => {
    if (!file) {
      const newItems = [...(values.homeRecentWorkItems || [])]
      newItems[idx] = { ...newItems[idx], imageUrl: '' }
      setValue('homeRecentWorkItems', newItems)
      return
    }

    try {
      setUploadingIndex(idx)
      const uploaded = await uploadServicesImage(file)
      const newItems = [...(values.homeRecentWorkItems || [])]
      newItems[idx] = { ...newItems[idx], imageUrl: uploaded.absoluteUrl }
      setValue('homeRecentWorkItems', newItems)
      setToastVariant('success')
      setToastMessage('Project image uploaded successfully.')
      setToastOpen(true)
    } catch (err) {
      setToastVariant('error')
      setToastMessage('Failed to upload project image.')
      setToastOpen(true)
    } finally {
      setUploadingIndex(null)
    }
  }

  if (isPending) return <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4"><Loader size="lg" label="Loading Home content..." /></div>

  if (isError) return (
    <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
        <FiSettings className="mx-auto mb-4 text-4xl text-red-600" />
        <p className="text-lg font-bold text-red-800">Could not load content</p>
        <ActionButton className="mt-6" intent="secondary" onClick={() => refetch()} leftIcon={<FiRefreshCw />}>Retry</ActionButton>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col">
      <Toast open={toastOpen} message={toastMessage} variant={toastVariant} title={toastVariant === 'success' ? 'Success' : 'Error'} onClose={() => setToastOpen(false)} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col pb-20">
        <div className="sticky top-[4.5rem] z-20 flex items-center justify-between border-b border-[var(--ui-border)] bg-white/95 px-4 py-3 backdrop-blur-md md:px-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--ui-text)]">Home Master Content</h1>
            <p className="text-xs text-[var(--ui-muted)]">Manage Services and Recent Work sections</p>
          </div>
          <ActionButton type="submit" intent="primary" size="sm" loading={mutation.isPending || uploadingIndex !== null} leftIcon={<FiSave />}>Save Changes</ActionButton>
        </div>

        <div className="mx-auto w-full max-w-5xl p-4 space-y-8 md:p-8">

          {/* Section: Our Services Header */}
          <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-[var(--ui-primary)] border-b border-[var(--ui-border)] pb-4 mb-4">
              <FiLayout className="text-xl" />
              <h2 className="text-base font-bold text-[var(--ui-text)]">Our Services Section Header</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Section Badge"
                value={values.homeServicesBadge || ''}
                onChange={(e) => setValue('homeServicesBadge', e.target.value)}
                placeholder="e.g. OUR SERVICES"
              />
              <Input
                label="Section Title"
                value={values.homeServicesTitle || ''}
                onChange={(e) => setValue('homeServicesTitle', e.target.value)}
                placeholder="e.g. Solutions That Drive Growth"
              />
            </div>
          </div>

          {/* Section: Recent Work */}
          <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6 text-[var(--ui-text)]">
            <div className="flex items-center gap-2 text-[var(--ui-primary)] border-b border-[var(--ui-border)] pb-4 mb-4">
              <FiBriefcase className="text-xl" />
              <h2 className="text-base font-bold text-[var(--ui-text)]">Recent Work Section</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Section Badge"
                value={values.homeRecentWorkBadge || ''}
                onChange={(e) => setValue('homeRecentWorkBadge', e.target.value)}
                placeholder="e.g. FEATURED PROJECTS"
              />
              <Input
                label="Section Title"
                value={values.homeRecentWorkTitle || ''}
                onChange={(e) => setValue('homeRecentWorkTitle', e.target.value)}
                placeholder="e.g. Some Of Our Recent Work"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--ui-text)]">Featured Projects List</h3>
              {(values.homeRecentWorkItems || []).map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-4 border border-[var(--ui-border)] rounded-xl space-y-4 bg-slate-50/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Project #{idx + 1}</span>
                    <ActionButton type="button" intent="delete" size="sm" onClick={() => {
                      const newItems = (values.homeRecentWorkItems || []).filter((_, i) => i !== idx)
                      setValue('homeRecentWorkItems', newItems)
                    }}><FiTrash2 /></ActionButton>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Project Title" value={item.title} onChange={(e) => {
                      const newItems = [...(values.homeRecentWorkItems || [])]
                      newItems[idx] = { ...newItems[idx], title: e.target.value }
                      setValue('homeRecentWorkItems', newItems)
                    }} />
                    <Input label="Category" value={item.category} onChange={(e) => {
                      const newItems = [...(values.homeRecentWorkItems || [])]
                      newItems[idx] = { ...newItems[idx], category: e.target.value }
                      setValue('homeRecentWorkItems', newItems)
                    }} />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      {uploadingIndex === idx ? (
                        <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-[var(--ui-border)] bg-slate-50/50">
                          <Loader size="md" label="Uploading project image..." />
                        </div>
                      ) : (
                        <ImageUploadField
                          label="Project Image"
                          selectedFile={null}
                          existingImageUrl={item.imageUrl}
                          previewAlt={`Project ${item.title || idx + 1} Preview`}
                          onFileChange={(file) => handleProjectImageChange(idx, file)}
                          onRemove={() => handleProjectImageChange(idx, null)}
                        />
                      )}
                    </div>
                    <div className="space-y-4">
                      <label className="grid gap-1.5">
                        <span className="text-sm font-semibold text-[var(--ui-text)]">Badge Color Theme</span>
                        <div className="relative">
                          <select
                            className="h-11 w-full rounded-lg border border-[var(--ui-border)] bg-white pl-3 pr-10 text-sm text-[var(--ui-text)] outline-none focus:border-[var(--ui-primary)] appearance-none cursor-pointer"
                            value={item.badgeClass}
                            onChange={(e) => {
                              const newItems = [...(values.homeRecentWorkItems || [])]
                              newItems[idx] = { ...newItems[idx], badgeClass: e.target.value }
                              setValue('homeRecentWorkItems', newItems)
                            }}
                          >
                            <option value="bg-blue-50 text-blue-600 border border-blue-100">Blue</option>
                            <option value="bg-emerald-50 text-emerald-600 border border-emerald-100">Emerald</option>
                            <option value="bg-purple-50 text-purple-600 border border-purple-100">Purple</option>
                            <option value="bg-amber-50 text-amber-600 border border-amber-100">Amber</option>
                            <option value="bg-rose-50 text-rose-600 border border-rose-100">Rose</option>
                            <option value="bg-slate-50 text-slate-600 border border-slate-100">Slate</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ui-muted)]">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </label>
                      
                      <Input label="Fallback Image URL (Optional)" value={item.imageUrl} onChange={(e) => {
                        const newItems = [...(values.homeRecentWorkItems || [])]
                        newItems[idx] = { ...newItems[idx], imageUrl: e.target.value }
                        setValue('homeRecentWorkItems', newItems)
                      }} />
                    </div>
                  </div>

                  <Input label="Description" value={item.description} onChange={(e) => {
                    const newItems = [...(values.homeRecentWorkItems || [])]
                    newItems[idx] = { ...newItems[idx], description: e.target.value }
                    setValue('homeRecentWorkItems', newItems)
                  }} />
                </div>
              ))}
              <ActionButton
                type="button"
                intent="secondary"
                className="w-full"
                leftIcon={<FiPlus />}
                onClick={() => {
                  const newItems = [...(values.homeRecentWorkItems || []), { id: Date.now().toString(), title: '', description: '', category: '', imageUrl: '', badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100' }]
                  setValue('homeRecentWorkItems', newItems)
                }}
              >Add Project</ActionButton>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
