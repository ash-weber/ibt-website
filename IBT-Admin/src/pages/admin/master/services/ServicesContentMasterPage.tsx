import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'
import {
  FiList,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiLayers,
  FiSettings
} from 'react-icons/fi'
import * as FiIcons from 'react-icons/fi'
import { getSettings, saveSettings } from '../../../../api/settings'
import { ActionButton, Dropdown, Input, Loader, RichTextEditor, Toast } from '../../../../component'
import { useSocketSettings } from '../../../../providers/SocketSettingsProvider'
import { settingsSchema } from '../../../../features/settings/validation'
import { SETTINGS_KEYS, type SettingEntity, type SettingsFormValues } from '../../../../types/settings'

const servicesSettingsSchema = settingsSchema.pick({
  servicesWhatTitle: true,
  servicesWhatDescription: true,
  servicesWhatFeatures: true,
  servicesProcessTitle: true,
  servicesProcessBadge: true,
  servicesProcessDescription: true,
  servicesProcessSteps: true,
})

type ServicesSettingsSchema = z.infer<typeof servicesSettingsSchema>
type FieldErrors = Partial<Record<keyof ServicesSettingsSchema, string>>
type ApiError = { message?: string }

const SETTINGS_QUERY_KEY = ['settings']

const DEFAULT_VALUES: any = {
  servicesWhatTitle: 'What We Do',
  servicesWhatDescription: 'We build digital products that power growth and drive conversion. Our team fuses design excellence with clean engineering to deliver software that scales.',
  servicesWhatFeatures: [
    { title: 'Web App Development', desc: 'Custom frontend and backend web applications built with modern frameworks.', icon: 'FiLayers' },
    { title: 'Mobile Solutions', desc: 'Native and hybrid iOS/Android mobile apps engineered for speed.', icon: 'FiSmartphone' },
    { title: 'Cloud Infrastructure', desc: 'Secure, high-availability deployments with seamless scaling.', icon: 'FiCloud' },
    { title: 'UX/UI Engineering', desc: 'Vibrant, high-fidelity responsive user interfaces that convert.', icon: 'FiMonitor' },
  ],
  servicesProcessTitle: 'How We Deliver Excellence',
  servicesProcessBadge: 'Our Process',
  servicesProcessDescription: 'A proven process, a skilled team and the right technology to deliver exceptional results.',
  servicesProcessSteps: [
    { step: '01', title: 'Discovery', desc: 'We deep-dive into your business goals, technical landscape, and user needs to craft a tailored strategy.' },
    { step: '02', title: 'Architecture', desc: 'Our senior architects design scalable, secure solutions aligned with your long-term growth roadmap.' },
    { step: '03', title: 'Build & Iterate', desc: 'Agile sprints with continuous delivery — you see progress every two weeks, not just at the end.' },
    { step: '04', title: 'Launch & Scale', desc: 'Production-grade deployment with monitoring, support, and optimization built in from day one.' },
  ],
}

function settingsToForm(settings: SettingEntity[]): any {
  const map = new Map(settings.map((item) => [item.key, item.value]))

  const readString = (key: keyof typeof SETTINGS_KEYS, fallback: string) => {
    const value = map.get(SETTINGS_KEYS[key])
    return typeof value === 'string' ? value : fallback
  }

  const readJson = (key: keyof typeof SETTINGS_KEYS, fallback: any) => {
    const val = map.get(SETTINGS_KEYS[key])
    if (Array.isArray(val)) {
      return val.length > 0 ? val : fallback
    }
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch { }
    }
    return fallback
  }

  return {
    servicesWhatTitle: readString('SERVICES_WHAT_TITLE', DEFAULT_VALUES.servicesWhatTitle),
    servicesWhatDescription: readString('SERVICES_WHAT_DESCRIPTION', DEFAULT_VALUES.servicesWhatDescription),
    servicesWhatFeatures: readJson('SERVICES_WHAT_FEATURES', DEFAULT_VALUES.servicesWhatFeatures),
    servicesProcessTitle: readString('SERVICES_PROCESS_TITLE', DEFAULT_VALUES.servicesProcessTitle),
    servicesProcessBadge: readString('SERVICES_PROCESS_BADGE', DEFAULT_VALUES.servicesProcessBadge),
    servicesProcessDescription: readString('SERVICES_PROCESS_DESCRIPTION', DEFAULT_VALUES.servicesProcessDescription),
    servicesProcessSteps: readJson('SERVICES_PROCESS_STEPS', DEFAULT_VALUES.servicesProcessSteps),
  }
}

function mapValidationErrors(values: ServicesSettingsSchema) {
  const result = servicesSettingsSchema.safeParse(values)
  if (result.success) {
    return { valid: true as const, errors: {} as FieldErrors }
  }
  const flattened = result.error.flatten().fieldErrors
  const nextErrors: FieldErrors = {}
  for (const key of Object.keys(flattened) as Array<keyof typeof flattened>) {
    const message = flattened[key]?.[0]
    if (message) {
      nextErrors[key as keyof FieldErrors] = message
    }
  }
  return { valid: false as const, errors: nextErrors }
}

const AVAILABLE_ICONS = [
  'FiLayers',
  'FiSmartphone',
  'FiCloud',
  'FiMonitor',
  'FiCode',
  'FiBarChart2',
  'FiTrendingUp',
  'FiShield',
  'FiCpu',
  'FiDatabase',
  'FiPenTool',
  'FiSettings',
  'FiUsers',
  'FiTarget',
  'FiZap',
  'FiBriefcase',
  'FiActivity',
  'FiGlobe',
  'FiServer',
  'FiGrid',
  'FiTerminal',
  'FiHardDrive'
]

const getIconOptions = (currentValue: string) => {
  const options = AVAILABLE_ICONS.map((iconName) => {
    const IconComponent = (FiIcons as any)[iconName] || FiIcons.FiBriefcase
    return {
      label: iconName,
      value: iconName,
      icon: <IconComponent className="text-sm" />
    }
  })

  if (currentValue && !AVAILABLE_ICONS.includes(currentValue)) {
    const IconComponent = (FiIcons as any)[currentValue] || FiIcons.FiBriefcase
    options.unshift({
      label: currentValue,
      value: currentValue,
      icon: <IconComponent className="text-sm" />
    })
  }
  return options
}

export function ServicesContentMasterPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<SettingsFormValues>(DEFAULT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<'what-we-do' | 'process'>('what-we-do')
  const lastRealtimeUpdateRef = useRef<string | null>(null)

  const { data, isPending, isError, error, refetch } = useQuery({
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
      setToastMessage('Services content updated successfully.')
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
      const errorList = Object.entries(validation.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('; ')
      setToastMessage(`Validation failed - ${errorList}`)
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

  const setValue = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  if (isPending) return <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4"><Loader size="lg" label="Loading Services content..." /></div>

  if (isError) return (
    <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
        <FiSettings className="mx-auto mb-4 text-4xl text-red-600" />
        <p className="text-lg font-bold text-red-800">Could not load content</p>
        <p className="text-sm text-red-600 mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <ActionButton className="mt-6" intent="secondary" onClick={() => void refetch()} leftIcon={<FiRefreshCw />}>Retry</ActionButton>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col">
      <Toast open={toastOpen} message={toastMessage} variant={toastVariant} title={toastVariant === 'success' ? 'Success' : 'Error'} onClose={() => setToastOpen(false)} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col pb-20">
        <div className="sticky top-[4.5rem] z-20 flex items-center justify-between border-b border-[var(--ui-border)] bg-white/95 px-4 py-3 backdrop-blur-md md:px-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--ui-text)]">Services Master Content</h1>
            <p className="text-xs text-[var(--ui-muted)]">Configure What We Do and How We Deliver sections</p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton type="button" intent="ghost" size="sm" onClick={handleReset} leftIcon={<FiRefreshCw />}>Reset</ActionButton>
            <ActionButton type="submit" intent="primary" size="sm" loading={mutation.isPending} leftIcon={<FiSave />}>Save Changes</ActionButton>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl p-4 md:p-8 space-y-6">
          {/* Section Selector Tab Nav */}
          <div className="flex border-b border-[var(--ui-border)] overflow-x-auto gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('what-we-do')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'what-we-do'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiLayers /> What We Do ({values.servicesWhatFeatures?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('process')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'process'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiList /> How We Deliver ({values.servicesProcessSteps?.length || 0})
            </button>
          </div>

          {/* Tab Content: What We Do */}
          {activeTab === 'what-we-do' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4 mb-4">
                <div className="flex items-center gap-2 text-[var(--ui-primary)]">
                  <FiLayers className="text-xl" />
                  <h2 className="text-base font-bold text-[var(--ui-text)]">What We Do Features</h2>
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    const nextFeatures = [...(values.servicesWhatFeatures || [])]
                    nextFeatures.push({
                      title: 'New Service Capability',
                      desc: 'Describe what this service does and why it benefits our clients.',
                      icon: 'FiLayers'
                    })
                    setValue('servicesWhatFeatures', nextFeatures)
                  }}
                >Add Capability Card</ActionButton>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  className="md:col-span-2"
                  label="What We Do Title"
                  name="servicesWhatTitle"
                  value={values.servicesWhatTitle || ''}
                  onChange={(e) => setValue('servicesWhatTitle', e.target.value)}
                  error={errors.servicesWhatTitle}
                  placeholder="e.g. What We Do"
                />
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-semibold text-[var(--ui-text)]">What We Do Description</label>
                  <div className="rounded-lg border border-[var(--ui-border)] overflow-hidden">
                    <RichTextEditor
                      value={values.servicesWhatDescription || ''}
                      onChange={(val) => setValue('servicesWhatDescription', val)}
                      error={errors.servicesWhatDescription}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-[var(--ui-border)]">
                {(values.servicesWhatFeatures || []).map((feat: any, idx: number) => (
                  <div key={idx} className="p-4 border border-[var(--ui-border)] rounded-xl space-y-4 bg-slate-50/15">
                    <div className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">Capability Card #{idx + 1}</span>
                      <ActionButton
                        type="button"
                        intent="delete"
                        size="sm"
                        onClick={() => {
                          const nextFeatures = (values.servicesWhatFeatures || []).filter((_: any, i: number) => i !== idx)
                          setValue('servicesWhatFeatures', nextFeatures)
                        }}
                      >
                        <FiTrash2 /> Remove
                      </ActionButton>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Card Title"
                        value={feat.title}
                        onChange={(e) => {
                          const nextFeatures = [...(values.servicesWhatFeatures || [])]
                          nextFeatures[idx] = { ...feat, title: e.target.value }
                          setValue('servicesWhatFeatures', nextFeatures)
                        }}
                        placeholder="e.g. Web App Development"
                      />
                      <div className="grid gap-1.5">
                        <span className="text-sm font-semibold text-[var(--ui-text)]">Icon Name (Feather Icons)</span>
                        <Dropdown
                          showSearch={true}
                          searchPlaceholder="Search icon..."
                          options={getIconOptions(feat.icon)}
                          value={feat.icon || 'FiLayers'}
                          onChange={(value) => {
                            const nextFeatures = [...(values.servicesWhatFeatures || [])]
                            nextFeatures[idx] = { ...feat, icon: value }
                            setValue('servicesWhatFeatures', nextFeatures)
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--ui-text)]">Card Description</label>
                      <textarea
                        className="w-full rounded-lg border border-[var(--ui-border)] p-3 text-sm focus:border-[var(--ui-primary)] focus:ring-1 focus:ring-[var(--ui-primary)] outline-none min-h-[80px] bg-white text-[var(--ui-text)]"
                        rows={2}
                        value={feat.desc}
                        onChange={(e) => {
                          const nextFeatures = [...(values.servicesWhatFeatures || [])]
                          nextFeatures[idx] = { ...feat, desc: e.target.value }
                          setValue('servicesWhatFeatures', nextFeatures)
                        }}
                        placeholder="Short description of this capability..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: How We Deliver */}
          {activeTab === 'process' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4 mb-4">
                <div className="flex items-center gap-2 text-[var(--ui-primary)]">
                  <FiList className="text-xl" />
                  <h2 className="text-base font-bold text-[var(--ui-text)]">How We Deliver Steps</h2>
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    const nextSteps = [...(values.servicesProcessSteps || [])]
                    const nextNum = (nextSteps.length + 1).toString().padStart(2, '0')
                    nextSteps.push({
                      step: nextNum,
                      title: 'New Delivery Step',
                      desc: 'Describe what happens during this step of our deliver process.'
                    })
                    setValue('servicesProcessSteps', nextSteps)
                  }}
                >Add Process Step</ActionButton>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="How We Deliver Title"
                  name="servicesProcessTitle"
                  value={values.servicesProcessTitle || ''}
                  onChange={(e) => setValue('servicesProcessTitle', e.target.value)}
                  error={errors.servicesProcessTitle}
                  placeholder="e.g. How We Deliver Excellence"
                />
                <Input
                  label="Section Badge Text"
                  name="servicesProcessBadge"
                  value={values.servicesProcessBadge || ''}
                  onChange={(e) => setValue('servicesProcessBadge', e.target.value)}
                  error={errors.servicesProcessBadge}
                  placeholder="e.g. HOW WE DELIVER"
                />
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-semibold text-[var(--ui-text)]">Section Description</label>
                  <div className="rounded-lg border border-[var(--ui-border)] overflow-hidden">
                    <RichTextEditor
                      value={values.servicesProcessDescription || ''}
                      onChange={(val) => setValue('servicesProcessDescription', val)}
                      error={errors.servicesProcessDescription}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-[var(--ui-border)]">
                {(values.servicesProcessSteps || []).map((step: any, idx: number) => (
                  <div key={idx} className="p-4 border border-[var(--ui-border)] rounded-xl space-y-4 bg-slate-50/15">
                    <div className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">Step Card #{idx + 1}</span>
                      <ActionButton
                        type="button"
                        intent="delete"
                        size="sm"
                        onClick={() => {
                          const nextSteps = (values.servicesProcessSteps || []).filter((_: any, i: number) => i !== idx)
                          setValue('servicesProcessSteps', nextSteps)
                        }}
                      >
                        <FiTrash2 /> Remove
                      </ActionButton>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Step Number"
                        value={step.step}
                        onChange={(e) => {
                          const nextSteps = [...(values.servicesProcessSteps || [])]
                          nextSteps[idx] = { ...step, step: e.target.value }
                          setValue('servicesProcessSteps', nextSteps)
                        }}
                        placeholder="e.g. 01"
                      />
                      <Input
                        label="Step Title"
                        value={step.title}
                        onChange={(e) => {
                          const nextSteps = [...(values.servicesProcessSteps || [])]
                          nextSteps[idx] = { ...step, title: e.target.value }
                          setValue('servicesProcessSteps', nextSteps)
                        }}
                        placeholder="e.g. Discovery"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--ui-text)]">Step Description</label>
                      <textarea
                        className="w-full rounded-lg border border-[var(--ui-border)] p-3 text-sm focus:border-[var(--ui-primary)] focus:ring-1 focus:ring-[var(--ui-primary)] outline-none min-h-[80px] bg-white text-[var(--ui-text)]"
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const nextSteps = [...(values.servicesProcessSteps || [])]
                          nextSteps[idx] = { ...step, desc: e.target.value }
                          setValue('servicesProcessSteps', nextSteps)
                        }}
                        placeholder="Short description of this delivery step..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
