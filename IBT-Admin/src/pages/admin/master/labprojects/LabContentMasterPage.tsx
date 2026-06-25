import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'
import {
  FiGrid,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSettings,
  FiTrash2,
  FiAward,
  FiUsers
} from 'react-icons/fi'
import { getSettings, saveSettings } from '../../../../api/settings'
import { ActionButton, Input, Loader, RichTextEditor, Toast } from '../../../../component'
import { useSocketSettings } from '../../../../providers/SocketSettingsProvider'
import { settingsSchema } from '../../../../features/settings/validation'
import { SETTINGS_KEYS, type SettingEntity, type SettingsFormValues } from '../../../../types/settings'
import { SpotlightImageUpload } from '../../components/SpotlightImageUpload'

const labsSettingsSchema = settingsSchema.pick({
  labsInitiatives: true,
  labsRigorTitle: true,
  labsRigorDescription: true,
  labsRigorPoints: true,
  labsRigorImage: true,
  labsMentorshipTitle: true,
  labsMentorshipDescription: true,
  labsMentorshipImage: true,
  labsMentorshipQuote: true,
  labsMentorshipQuoteAuthor: true,
  labsMentorshipQuoteRole: true,
  labsMentorshipQuoteAvatar: true,
})

type LabsSettingsSchema = z.infer<typeof labsSettingsSchema>
type FieldErrors = Partial<Record<keyof LabsSettingsSchema, string>>
type ApiError = { message?: string }

const SETTINGS_QUERY_KEY = ['settings']

const DEFAULT_VALUES: any = {
  labsInitiatives: [
    {
      id: 'init1',
      badge: 'ACTIVE RESEARCH',
      title: 'Next-Gen Robotics.',
      description: 'Developing autonomous systems for precision manufacturing and hazardous environment exploration.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000',
      link: '/services',
      btnText: '',
      layout: 'dark-large'
    },
    {
      id: 'init2',
      badge: '',
      title: 'Careersheets',
      description: 'The ultimate architectural tool for job seekers to track professional growth.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
      link: '/services',
      btnText: 'Learn More',
      layout: 'light-row'
    },
    {
      id: 'init3',
      badge: '',
      title: 'Join the Lab Ecosystem',
      description: 'Collaborate with industry veterans on real-world challenges that define the next decade.',
      imageUrl: '',
      link: '',
      btnText: 'Submit Portfolio',
      layout: 'gradient-cta'
    }
  ],
  labsRigorTitle: 'Technical Rigor',
  labsRigorDescription: 'Our laboratory environment is built on the principles of mechanical and digital precision. We believe that true innovation happens at the intersection of rigorous testing and creative problem-solving.',
  labsRigorPoints: [
    'Phase-gate project management systems',
    'Peer-reviewed code and design standards',
    'Iterative prototyping and stress testing'
  ],
  labsRigorImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
  labsMentorshipTitle: 'Mentorship-First',
  labsMentorshipDescription: 'Every project is guided by industry veterans. This isn\'t just about learning tools; it\'s about adopting the mindset of a senior architect. We foster an environment of constant feedback and high-stakes accountability.',
  labsMentorshipImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
  labsMentorshipQuote: 'The laboratory isn\'t just a place of work; it\'s a sanctuary for those who pursue technical excellence with religious devotion.',
  labsMentorshipQuoteAuthor: 'Lead Researcher',
  labsMentorshipQuoteRole: 'IBT LABS CORE TEAM',
  labsMentorshipQuoteAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
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
    labsInitiatives: readJson('LABS_INITIATIVES', DEFAULT_VALUES.labsInitiatives),
    labsRigorTitle: readString('LABS_RIGOR_TITLE', DEFAULT_VALUES.labsRigorTitle),
    labsRigorDescription: readString('LABS_RIGOR_DESCRIPTION', DEFAULT_VALUES.labsRigorDescription),
    labsRigorPoints: readJson('LABS_RIGOR_POINTS', DEFAULT_VALUES.labsRigorPoints),
    labsRigorImage: readString('LABS_RIGOR_IMAGE', DEFAULT_VALUES.labsRigorImage),
    labsMentorshipTitle: readString('LABS_MENTORSHIP_TITLE', DEFAULT_VALUES.labsMentorshipTitle),
    labsMentorshipDescription: readString('LABS_MENTORSHIP_DESCRIPTION', DEFAULT_VALUES.labsMentorshipDescription),
    labsMentorshipImage: readString('LABS_MENTORSHIP_IMAGE', DEFAULT_VALUES.labsMentorshipImage),
    labsMentorshipQuote: readString('LABS_MENTORSHIP_QUOTE', DEFAULT_VALUES.labsMentorshipQuote),
    labsMentorshipQuoteAuthor: readString('LABS_MENTORSHIP_QUOTE_AUTHOR', DEFAULT_VALUES.labsMentorshipQuoteAuthor),
    labsMentorshipQuoteRole: readString('LABS_MENTORSHIP_QUOTE_ROLE', DEFAULT_VALUES.labsMentorshipQuoteRole),
    labsMentorshipQuoteAvatar: readString('LABS_MENTORSHIP_QUOTE_AVATAR', DEFAULT_VALUES.labsMentorshipQuoteAvatar),
  }
}

function mapValidationErrors(values: LabsSettingsSchema) {
  const result = labsSettingsSchema.safeParse(values)
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

export function LabContentMasterPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<SettingsFormValues>(DEFAULT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<'initiatives' | 'rigor' | 'mentorship'>('initiatives')
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
      setToastMessage('Labs content updated successfully.')
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

  const setValue = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  if (isPending) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <Loader size="lg" label="Loading labs content" />
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
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col">
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Success' : 'Error'}
        onClose={() => setToastOpen(false)}
      />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col pb-20">
        {/* Header Section */}
        <div className="sticky top-[4.5rem] z-20 flex items-center justify-between border-b border-[var(--ui-border)] bg-white/95 px-4 py-3 backdrop-blur-md md:px-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--ui-text)]">Labs Master Content</h1>
            <p className="text-xs text-[var(--ui-muted)]">Manage dynamic content for Initiatives, Technical Rigor, and Mentorship</p>
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

        {/* Tab Navigation */}
        <div className="border-b border-[var(--ui-border)] bg-white px-4 md:px-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('initiatives')}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-all ${
                activeTab === 'initiatives'
                  ? 'border-red-600 text-red-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiGrid />
              Lab Initiatives
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rigor')}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-all ${
                activeTab === 'rigor'
                  ? 'border-red-600 text-red-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiAward />
              Technical Rigor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentorship')}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-all ${
                activeTab === 'mentorship'
                  ? 'border-red-600 text-red-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiUsers />
              Mentorship-First
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl p-4 space-y-8 md:p-8">
          {/* TAB 1: Lab Initiatives */}
          {activeTab === 'initiatives' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4">
                <div className="flex items-center gap-2 text-[var(--ui-primary)]">
                  <FiGrid className="text-xl" />
                  <div>
                    <h2 className="text-base font-bold text-[var(--ui-text)]">Initiatives Cards</h2>
                    <p className="text-xs text-[var(--ui-muted)]">Configure the grid of dynamic initiatives on the Labs page</p>
                  </div>
                </div>
                <ActionButton
                  type="button"
                  size="sm"
                  intent="secondary"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    const newCard = {
                      id: crypto.randomUUID(),
                      badge: 'NEW INITIATIVE',
                      title: 'Title of Initiative',
                      description: 'Provide details about the initiative.',
                      imageUrl: '',
                      link: '',
                      btnText: '',
                      layout: 'dark-large'
                    }
                    setValue('labsInitiatives', [...(values.labsInitiatives || []), newCard])
                  }}
                >
                  Add Initiative Card
                </ActionButton>
              </div>

              {(!values.labsInitiatives || values.labsInitiatives.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-[var(--ui-border)] p-12 text-center">
                  <p className="text-sm text-[var(--ui-muted)]">No initiatives cards added yet. Click the button above to add one.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {values.labsInitiatives.map((card, index) => (
                    <div key={card.id} className="relative rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6 group">
                      <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-[var(--ui-muted)] uppercase tracking-widest">
                          Card #{index + 1}
                        </span>
                        <ActionButton
                          type="button"
                          intent="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setValue('labsInitiatives', (values.labsInitiatives || []).filter(c => c.id !== card.id))
                          }}
                        >
                          <FiTrash2 />
                        </ActionButton>
                      </div>

                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                          <Input
                            label="Badge / Tag"
                            value={card.badge}
                            onChange={(e) => {
                              const next = [...(values.labsInitiatives || [])]
                              next[index] = { ...next[index], badge: e.target.value }
                              setValue('labsInitiatives', next)
                            }}
                            placeholder="e.g. ACTIVE RESEARCH"
                          />
                          <Input
                            label="Initiative Title"
                            value={card.title}
                            onChange={(e) => {
                              const next = [...(values.labsInitiatives || [])]
                              next[index] = { ...next[index], title: e.target.value }
                              setValue('labsInitiatives', next)
                            }}
                            placeholder="e.g. Next-Gen Robotics."
                          />
                          <div className="grid gap-1.5 md:col-span-2">
                            <span className="text-sm font-semibold text-slate-700">Card Layout Style</span>
                            <select
                              value={card.layout}
                              onChange={(e) => {
                                const next = [...(values.labsInitiatives || [])]
                                next[index] = { ...next[index], layout: e.target.value }
                                setValue('labsInitiatives', next)
                              }}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-white"
                            >
                              <option value="dark-large">Dark Large Card (Image background, mix-blend)</option>
                              <option value="light-row">Light Row Card (Image + text side by side)</option>
                              <option value="gradient-cta">Gradient CTA Card (Red-gradient container with buttons)</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <SpotlightImageUpload
                            label="Card Image"
                            imageUrl={card.imageUrl}
                            onUrlChange={(url) => {
                              const next = [...(values.labsInitiatives || [])]
                              next[index] = { ...next[index], imageUrl: url }
                              setValue('labsInitiatives', next)
                            }}
                          />
                        </div>
                      </div>

                      <RichTextEditor
                        label="Card Description"
                        value={card.description}
                        onChange={(val) => {
                          const next = [...(values.labsInitiatives || [])]
                          next[index] = { ...next[index], description: val }
                          setValue('labsInitiatives', next)
                        }}
                      />

                      <div className="grid gap-6 md:grid-cols-2">
                        <Input
                          label="Button Text"
                          value={card.btnText}
                          onChange={(e) => {
                            const next = [...(values.labsInitiatives || [])]
                            next[index] = { ...next[index], btnText: e.target.value }
                            setValue('labsInitiatives', next)
                          }}
                          placeholder="e.g. Learn More (leave empty for default/none)"
                        />
                        <Input
                          label="Target Link / URL"
                          value={card.link}
                          onChange={(e) => {
                            const next = [...(values.labsInitiatives || [])]
                            next[index] = { ...next[index], link: e.target.value }
                            setValue('labsInitiatives', next)
                          }}
                          placeholder="e.g. /services"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Technical Rigor */}
          {activeTab === 'rigor' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-[var(--ui-primary)] border-b border-[var(--ui-border)] pb-4 mb-4">
                <FiAward className="text-xl" />
                <div>
                  <h2 className="text-base font-bold text-[var(--ui-text)]">Technical Rigor Section</h2>
                  <p className="text-xs text-[var(--ui-muted)]">Manage content explaining technical processes and rigor standards</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <Input
                    label="Section Title"
                    name="labsRigorTitle"
                    value={values.labsRigorTitle || ''}
                    onChange={(e) => setValue('labsRigorTitle', e.target.value)}
                    error={errors.labsRigorTitle}
                    placeholder="e.g. Technical Rigor"
                  />

                  <RichTextEditor
                    label="Section Description"
                    name="labsRigorDescription"
                    value={values.labsRigorDescription || ''}
                    onChange={(val) => setValue('labsRigorDescription', val)}
                    error={errors.labsRigorDescription}
                    minHeight={150}
                  />
                </div>

                <div className="space-y-6">
                  <SpotlightImageUpload
                    label="Rigor Showcase Image"
                    imageUrl={values.labsRigorImage || ''}
                    onUrlChange={(url) => setValue('labsRigorImage', url)}
                  />
                </div>
              </div>

              <div className="border-t border-[var(--ui-border)] pt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Rigor Checklist Points</h3>
                <div className="space-y-3">
                  {(values.labsRigorPoints || []).map((point, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-[#e63946] flex items-center justify-center text-xs font-black shrink-0">
                        {String(pIdx + 1).padStart(2, '0')}
                      </div>
                      <Input
                        value={point}
                        onChange={(e) => {
                          const nextPoints = [...(values.labsRigorPoints || [])]
                          nextPoints[pIdx] = e.target.value
                          setValue('labsRigorPoints', nextPoints)
                        }}
                        placeholder={`Point #${pIdx + 1}`}
                        className="flex-1"
                      />
                      <ActionButton
                        type="button"
                        intent="ghost"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => {
                          const nextPoints = (values.labsRigorPoints || []).filter((_, idx) => idx !== pIdx)
                          setValue('labsRigorPoints', nextPoints)
                        }}
                      >
                        <FiTrash2 />
                      </ActionButton>
                    </div>
                  ))}
                  <div className="pt-2">
                    <ActionButton
                      type="button"
                      intent="secondary"
                      size="sm"
                      leftIcon={<FiPlus />}
                      onClick={() => {
                        setValue('labsRigorPoints', [...(values.labsRigorPoints || []), ''])
                      }}
                    >
                      Add Checklist Point
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mentorship-First */}
          {activeTab === 'mentorship' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-[var(--ui-primary)] border-b border-[var(--ui-border)] pb-4 mb-4">
                <FiUsers className="text-xl" />
                <div>
                  <h2 className="text-base font-bold text-[var(--ui-text)]">Mentorship-First Section</h2>
                  <p className="text-xs text-[var(--ui-muted)]">Configure the mentorship values, showcase image, and leadership quote</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <Input
                    label="Section Title"
                    name="labsMentorshipTitle"
                    value={values.labsMentorshipTitle || ''}
                    onChange={(e) => setValue('labsMentorshipTitle', e.target.value)}
                    error={errors.labsMentorshipTitle}
                    placeholder="e.g. Mentorship-First"
                  />

                  <RichTextEditor
                    label="Section Description"
                    name="labsMentorshipDescription"
                    value={values.labsMentorshipDescription || ''}
                    onChange={(val) => setValue('labsMentorshipDescription', val)}
                    error={errors.labsMentorshipDescription}
                    minHeight={150}
                  />
                </div>

                <div className="space-y-6">
                  <SpotlightImageUpload
                    label="Mentorship Image"
                    imageUrl={values.labsMentorshipImage || ''}
                    onUrlChange={(url) => setValue('labsMentorshipImage', url)}
                  />
                </div>
              </div>

              {/* Quote Block Controls */}
              <div className="border-t border-[var(--ui-border)] pt-6 space-y-6">
                <h3 className="text-sm font-semibold text-slate-700">Leadership Quote Block</h3>
                
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-4">
                    <Input
                      label="Quote Author Name"
                      value={values.labsMentorshipQuoteAuthor || ''}
                      onChange={(e) => setValue('labsMentorshipQuoteAuthor', e.target.value)}
                      placeholder="e.g. Lead Researcher"
                    />
                    <Input
                      label="Quote Author Role / Subtitle"
                      value={values.labsMentorshipQuoteRole || ''}
                      onChange={(e) => setValue('labsMentorshipQuoteRole', e.target.value)}
                      placeholder="e.g. IBT LABS CORE TEAM"
                    />
                  </div>
                  <div>
                    <SpotlightImageUpload
                      label="Author Avatar"
                      imageUrl={values.labsMentorshipQuoteAvatar || ''}
                      onUrlChange={(url) => setValue('labsMentorshipQuoteAvatar', url)}
                    />
                  </div>
                </div>

                <RichTextEditor
                  label="Quote Content Text"
                  value={values.labsMentorshipQuote || ''}
                  onChange={(val) => setValue('labsMentorshipQuote', val)}
                  minHeight={100}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
