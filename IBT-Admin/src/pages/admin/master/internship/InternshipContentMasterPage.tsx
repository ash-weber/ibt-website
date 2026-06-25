import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'
import {
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiUsers,
  FiAward,
} from 'react-icons/fi'
import * as FiIcons from 'react-icons/fi'
import { getSettings, saveSettings, uploadServicesImage } from '../../../../api/settings'
import { ActionButton, Dropdown, Input, Loader, Toast } from '../../../../component'
import { ImageUploadField } from '../../components/ImageUploadField'
import { useSocketSettings } from '../../../../providers/SocketSettingsProvider'
import { settingsSchema } from '../../../../features/settings/validation'
import { SETTINGS_KEYS, type SettingEntity, type SettingsFormValues } from '../../../../types/settings'

const internshipSettingsSchema = settingsSchema.pick({
  internshipHeroTitle: true,
  internshipHeroSubtitle: true,
  internshipHeroDescription: true,
  internshipHeroImageUrl: true,
  internshipTestimonialsTitle: true,
  internshipClosingTitle: true,
  internshipClosingContent: true,
  internshipApplyEmail: true,
  internshipPrograms: true,
  internshipTestimonials: true,
})

type InternshipSettingsSchema = z.infer<typeof internshipSettingsSchema>
type FieldErrors = Partial<Record<keyof InternshipSettingsSchema, string>>
type ApiError = { message?: string }

const SETTINGS_QUERY_KEY = ['settings']

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

const DEFAULT_VALUES: any = {
  internshipHeroTitle: 'Internship Program',
  internshipHeroSubtitle: 'Learn by Building Real Products',
  internshipHeroDescription: 'Gain practical experience through hands-on projects, code reviews, and team collaboration.',
  internshipHeroImageUrl: '',
  internshipTestimonialsTitle: 'Testimonials',
  internshipClosingTitle: 'Build Your Career with IBT',
  internshipClosingContent: 'At I-BACUS-TECH, we provide practical, industry-aligned training.',
  internshipApplyEmail: 'hr@ibacustech.com',
  internshipPrograms: [
    {
      id: 'p1',
      title: 'Web Development',
      icon: 'FiMonitor',
      points: ['HTML, CSS, JavaScript', 'React.js, Node.js', 'Real-world Projects'],
      learnMoreLink: '/internship/apply',
      colorTheme: 'red'
    },
    {
      id: 'p2',
      title: 'Mobile App Development',
      icon: 'FiSmartphone',
      points: ['Flutter / React Native', 'Android Development', 'Live Project Experience'],
      learnMoreLink: '/internship/apply',
      colorTheme: 'blue'
    },
    {
      id: 'p3',
      title: 'Data Science & AI',
      icon: 'FiBarChart2',
      points: ['Python, Pandas, NumPy', 'Machine Learning', 'AI Model Development'],
      learnMoreLink: '/internship/apply',
      colorTheme: 'yellow'
    },
    {
      id: 'p4',
      title: 'UI/UX Design',
      icon: 'FiPenTool',
      points: ['Figma, Adobe XD', 'Wireframing & Prototyping', 'Design Thinking'],
      learnMoreLink: '/internship/apply',
      colorTheme: 'green'
    }
  ],
  internshipTestimonials: [
    {
      id: 't1',
      name: 'Ayush Verma',
      content: 'This internship helped me transition from a student to a developer. The projects and mentors are amazing!',
      role: 'Web Development Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 't2',
      name: 'Sneha Patel',
      content: 'I gained hands-on experience in real projects. It boosted my confidence and my career opportunities.',
      role: 'Data Science Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 't3',
      name: 'Rohan Kumar',
      content: 'Great learning environment, supportive mentors and practical exposure. Highly recommended!',
      role: 'AI/ML Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    }
  ]
}

function settingsToForm(settings: SettingEntity[]): any {
  const map = new Map(settings.map((item) => [item.key, item.value]))

  const readString = (key: keyof typeof SETTINGS_KEYS, fallback: string) => {
    const value = map.get(SETTINGS_KEYS[key])
    return typeof value === 'string' ? value : fallback
  }

  const readJson = (key: keyof typeof SETTINGS_KEYS, fallback: any) => {
    const val = map.get(SETTINGS_KEYS[key])
    if (Array.isArray(val)) return val
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed
      } catch { }
    }
    return fallback
  }

  return {
    internshipHeroTitle: readString('INTERNSHIP_HERO_TITLE', DEFAULT_VALUES.internshipHeroTitle),
    internshipHeroSubtitle: readString('INTERNSHIP_HERO_SUBTITLE', DEFAULT_VALUES.internshipHeroSubtitle),
    internshipHeroDescription: readString('INTERNSHIP_HERO_DESCRIPTION', DEFAULT_VALUES.internshipHeroDescription),
    internshipHeroImageUrl: readString('INTERNSHIP_HERO_IMAGE_URL', DEFAULT_VALUES.internshipHeroImageUrl),
    internshipTestimonialsTitle: readString('INTERNSHIP_TESTIMONIALS_TITLE', DEFAULT_VALUES.internshipTestimonialsTitle),
    internshipClosingTitle: readString('INTERNSHIP_CLOSING_TITLE', DEFAULT_VALUES.internshipClosingTitle),
    internshipClosingContent: readString('INTERNSHIP_CLOSING_CONTENT', DEFAULT_VALUES.internshipClosingContent),
    internshipApplyEmail: readString('INTERNSHIP_APPLY_EMAIL', DEFAULT_VALUES.internshipApplyEmail),
    internshipPrograms: readJson('INTERNSHIP_PROGRAMS', DEFAULT_VALUES.internshipPrograms),
    internshipTestimonials: readJson('INTERNSHIP_TESTIMONIALS', DEFAULT_VALUES.internshipTestimonials),
  }
}

function mapValidationErrors(values: InternshipSettingsSchema) {
  const result = internshipSettingsSchema.safeParse(values)
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

export function InternshipContentMasterPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<SettingsFormValues>(DEFAULT_VALUES)
  const [, setErrors] = useState<FieldErrors>({})
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<'programs' | 'testimonials'>('programs')
  const [uploadingField, setUploadingField] = useState<string | null>(null)
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
      setToastMessage('Internship content updated successfully.')
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

  const handleImageChange = async (field: string, file: File | null, index?: number) => {
    if (!file) {
      if (field === 'internshipTestimonials' && typeof index === 'number') {
        const nextList = [...(values.internshipTestimonials || [])]
        nextList[index] = { ...nextList[index], avatarUrl: '' }
        setValue('internshipTestimonials', nextList)
      } else {
        setValue(field as any, '')
      }
      return
    }

    try {
      const uploadId = index !== undefined ? `${field}_${index}` : field
      setUploadingField(uploadId)
      const uploaded = await uploadServicesImage(file)
      if (field === 'internshipTestimonials' && typeof index === 'number') {
        const nextList = [...(values.internshipTestimonials || [])]
        nextList[index] = { ...nextList[index], avatarUrl: uploaded.absoluteUrl }
        setValue('internshipTestimonials', nextList)
      } else {
        setValue(field as any, uploaded.absoluteUrl)
      }
      setToastVariant('success')
      setToastMessage('Image uploaded successfully.')
      setToastOpen(true)
    } catch {
      setToastVariant('error')
      setToastMessage('Failed to upload image.')
      setToastOpen(true)
    } finally {
      setUploadingField(null)
    }
  }

  if (isPending) return <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4"><Loader size="lg" label="Loading internship content..." /></div>

  if (isError) return (
    <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
        <FiAward className="mx-auto mb-4 text-4xl text-red-600" />
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
            <h1 className="text-lg font-bold text-[var(--ui-text)]">Internship Content</h1>
            <p className="text-xs text-[var(--ui-muted)]">Manage Hero, Programs offered, and Intern Testimonials</p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton type="button" intent="ghost" size="sm" onClick={handleReset} leftIcon={<FiRefreshCw />}>Reset</ActionButton>
            <ActionButton type="submit" intent="primary" size="sm" loading={mutation.isPending || uploadingField !== null} leftIcon={<FiSave />}>Save Changes</ActionButton>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl p-4 md:p-8 space-y-6">
          {/* Section Selector Tab Nav */}
          <div className="flex border-b border-[var(--ui-border)] overflow-x-auto gap-2">

            <button
              type="button"
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'programs'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
                }`}
            >
              <FiAward /> Programs We Offer ({values.internshipPrograms?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('testimonials')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'testimonials'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
                }`}
            >
              <FiUsers /> Intern Testimonials ({values.internshipTestimonials?.length || 0})
            </button>
          </div>


          {/* Tab Content: Programs We Offer */}
          {activeTab === 'programs' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4 mb-4">
                <div className="flex items-center gap-2 text-[var(--ui-primary)]">
                  <FiAward className="text-xl" />
                  <h2 className="text-base font-bold text-[var(--ui-text)]">Programs We Offer Cards</h2>
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    const newPrograms = [...(values.internshipPrograms || [])]
                    newPrograms.push({
                      id: `prog_${Date.now()}`,
                      title: 'New Program Role',
                      icon: 'FiMonitor',
                      points: ['Feature Requirement 1', 'Feature Requirement 2'],
                      learnMoreLink: '/internship/apply',
                      colorTheme: 'red'
                    })
                    setValue('internshipPrograms', newPrograms)
                  }}
                >Add Program Card</ActionButton>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {(values.internshipPrograms || []).map((prog: any, idx: number) => (
                  <div key={prog.id || idx} className="p-4 border border-[var(--ui-border)] rounded-xl space-y-4 bg-slate-50/15">
                    <div className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">Program Role #{idx + 1}</span>
                      <ActionButton
                        type="button"
                        intent="delete"
                        size="sm"
                        onClick={() => {
                          const newPrograms = (values.internshipPrograms || []).filter((_: any, i: number) => i !== idx)
                          setValue('internshipPrograms', newPrograms)
                        }}
                      >
                        <FiTrash2 />
                      </ActionButton>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Program Title"
                        value={prog.title}
                        onChange={(e) => {
                          const nextList = [...(values.internshipPrograms || [])]
                          nextList[idx] = { ...prog, title: e.target.value }
                          setValue('internshipPrograms', nextList)
                        }}
                        placeholder="e.g. Web Development"
                      />
                      <div className="grid gap-1.5">
                        <span className="text-sm font-semibold text-[var(--ui-text)]">Icon Name (Feather Icons)</span>
                        <Dropdown
                          showSearch={true}
                          searchPlaceholder="Search icon..."
                          options={getIconOptions(prog.icon)}
                          value={prog.icon || 'FiMonitor'}
                          onChange={(value) => {
                            const nextList = [...(values.internshipPrograms || [])]
                            nextList[idx] = { ...prog, icon: value }
                            setValue('internshipPrograms', nextList)
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Color Theme (red, blue, yellow, green)"
                        value={prog.colorTheme || 'red'}
                        onChange={(e) => {
                          const nextList = [...(values.internshipPrograms || [])]
                          nextList[idx] = { ...prog, colorTheme: e.target.value }
                          setValue('internshipPrograms', nextList)
                        }}
                        placeholder="e.g. red"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--ui-border)]">
                      <label className="block text-xs font-bold text-slate-500">Bullet Points / Features</label>
                      {(prog.points || []).map((pt: string, ptIdx: number) => (
                        <div key={ptIdx} className="flex gap-2 items-center">
                          <Input
                            className="flex-1"
                            value={pt}
                            onChange={(e) => {
                              const nextList = [...(values.internshipPrograms || [])]
                              const nextPoints = [...prog.points]
                              nextPoints[ptIdx] = e.target.value
                              nextList[idx] = { ...prog, points: nextPoints }
                              setValue('internshipPrograms', nextList)
                            }}
                            placeholder={`Point ${ptIdx + 1}`}
                          />
                          <ActionButton
                            type="button"
                            intent="delete"
                            size="sm"
                            onClick={() => {
                              const nextList = [...(values.internshipPrograms || [])]
                              const nextPoints = prog.points.filter((_: any, i: number) => i !== ptIdx)
                              nextList[idx] = { ...prog, points: nextPoints }
                              setValue('internshipPrograms', nextList)
                            }}
                          >
                            <FiTrash2 />
                          </ActionButton>
                        </div>
                      ))}
                      <ActionButton
                        type="button"
                        intent="secondary"
                        className="w-full text-xs"
                        leftIcon={<FiPlus />}
                        onClick={() => {
                          const nextList = [...(values.internshipPrograms || [])]
                          const nextPoints = [...(prog.points || []), '']
                          nextList[idx] = { ...prog, points: nextPoints }
                          setValue('internshipPrograms', nextList)
                        }}
                      >Add Point</ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Intern Testimonials */}
          {activeTab === 'testimonials' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4 mb-4">
                <div className="flex items-center gap-2 text-[var(--ui-primary)]">
                  <FiUsers className="text-xl" />
                  <h2 className="text-base font-bold text-[var(--ui-text)] flex items-center gap-2">
                    What Our Interns Say
                  </h2>
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    const newTestimonials = [...(values.internshipTestimonials || [])]
                    newTestimonials.push({
                      id: `test_${Date.now()}`,
                      name: 'Intern Name',
                      role: 'Intern Role',
                      content: 'Intern experience feedback content...',
                      avatarUrl: ''
                    })
                    setValue('internshipTestimonials', newTestimonials)
                  }}
                >Add Testimonial</ActionButton>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {(values.internshipTestimonials || []).map((test: any, idx: number) => (
                  <div key={test.id || idx} className="p-4 border border-[var(--ui-border)] rounded-xl space-y-4 bg-slate-50/15">
                    <div className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">Intern Quote #{idx + 1}</span>
                      <ActionButton
                        type="button"
                        intent="delete"
                        size="sm"
                        onClick={() => {
                          const newTestimonials = (values.internshipTestimonials || []).filter((_: any, i: number) => i !== idx)
                          setValue('internshipTestimonials', newTestimonials)
                        }}
                      >
                        <FiTrash2 />
                      </ActionButton>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Intern Name"
                        value={test.name}
                        onChange={(e) => {
                          const nextList = [...(values.internshipTestimonials || [])]
                          nextList[idx] = { ...test, name: e.target.value }
                          setValue('internshipTestimonials', nextList)
                        }}
                        placeholder="e.g. Sneha Patel"
                      />
                      <Input
                        label="Intern Role"
                        value={test.role}
                        onChange={(e) => {
                          const nextList = [...(values.internshipTestimonials || [])]
                          nextList[idx] = { ...test, role: e.target.value }
                          setValue('internshipTestimonials', nextList)
                        }}
                        placeholder="e.g. Data Science Intern"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--ui-text)]">Internship Feedback Quote</label>
                      <textarea
                        className="w-full rounded-lg border border-[var(--ui-border)] p-3 text-sm focus:border-[var(--ui-primary)] focus:ring-1 focus:ring-[var(--ui-primary)] outline-none min-h-[90px] bg-white text-[var(--ui-text)]"
                        rows={3}
                        value={test.content}
                        onChange={(e) => {
                          const nextList = [...(values.internshipTestimonials || [])]
                          nextList[idx] = { ...test, content: e.target.value }
                          setValue('internshipTestimonials', nextList)
                        }}
                        placeholder="Feedback quote..."
                      />
                    </div>

                    <div className="space-y-4 pt-2 border-t border-[var(--ui-border)]">
                      {uploadingField === `internshipTestimonials_${idx}` ? (
                        <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-[var(--ui-border)] bg-slate-50/50">
                          <Loader size="sm" label="Uploading avatar image..." />
                        </div>
                      ) : (
                        <ImageUploadField
                          label="Avatar Image"
                          selectedFile={null}
                          existingImageUrl={test.avatarUrl}
                          previewAlt={test.name}
                          onFileChange={(file) => handleImageChange('internshipTestimonials', file, idx)}
                          onRemove={() => handleImageChange('internshipTestimonials', null, idx)}
                        />
                      )}
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
