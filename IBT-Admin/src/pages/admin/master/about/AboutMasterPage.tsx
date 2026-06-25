import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiCheckCircle, FiInfo, FiRefreshCw, FiLayout, FiTrash2, FiPlus, FiTarget, FiMail } from 'react-icons/fi'
import * as FiIcons from 'react-icons/fi'
import { getSettings, saveSettings, uploadServicesImage } from '../../../../api/settings'
import { ActionButton, Dropdown, Input, Loader, RichTextEditor, Toast } from '../../../../component'
import { ImageUploadField } from '../../components/ImageUploadField'
import { useSocketSettings } from '../../../../providers/SocketSettingsProvider'
import { SETTINGS_KEYS, type SettingEntity } from '../../../../types/settings'

type ApiError = {
  message?: string
}

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
  'FiHardDrive',
  'FiLightbulb',
  'FiPieChart',
  'FiAward'
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
  aboutWhoTitle: 'Who Are We?',
  aboutWhoDescription: 'We are a digital and branding company that believes in the power of creative strategy and along with great design.',
  aboutWhoSecondaryDescription: 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.',
  aboutWhoFeatures: [
    { title: 'Result-Oriented Approach', desc: 'We focus on measurable results that drive business growth.' },
    { title: 'Experienced Professionals', desc: 'Skilled team with domain expertise and industry knowledge.' },
    { title: 'Innovative Solutions', desc: 'We use the latest technologies to create future-ready solutions.' },
    { title: 'Client-Centric Mindset', desc: 'Your goals are our priority. We grow when you grow.' }
  ],
  aboutWhoImages: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800'
  ],

  aboutProcessBadge: 'HOW IT WORKS?',
  aboutProcessTitle: 'Everything you need on creating a business process.',
  aboutProcessFeatures: [
    { title: 'Collect Ideas', desc: 'Nulla vitae elit libero pharetra augue dapibus.', icon: 'FiLightbulb' },
    { title: 'Data Analysis', desc: 'Vivamus sagittis lacus augue laoreet vel.', icon: 'FiPieChart' },
    { title: 'Magic Touch', desc: 'Cras mattis consectetur purus sit amet.', icon: 'FiPenTool' }
  ],
  aboutProcessImage: 'https://sandbox.elemisthemes.com/assets/img/illustrations/i2.png',

  aboutContactBadge: 'GET IN TOUCH',
  aboutContactTitle: 'Got any questions? Don\'t hesitate to get in touch.',
  aboutContactImage: 'https://sandbox.elemisthemes.com/assets/img/illustrations/i3.png',

  aboutMissionTitle: 'Our Mission',
  aboutMissionDesc: 'To provide cutting-edge technology solutions that empower organizations to achieve their full potential in the digital age through innovation and precision.',
  aboutVisionTitle: 'Our Vision',
  aboutVisionDesc: 'To be a global leader in digital transformation recognized for our engineering excellence and sustainable technological impact.',
  aboutMissionCards: [
    { value: '50+', label: 'Active Projects' },
    { value: 'Quality', label: 'ISO Certified' },
    { value: '24/7', label: 'Global Support' },
    { value: '100%', label: 'Data Security' }
  ],
}

function settingsToForm(settings: SettingEntity[]): any {
  const map = new Map(settings.map((item) => [item.key, item.value]))

  const readString = (key: keyof typeof SETTINGS_KEYS, fallback: string) => {
    const value = map.get(SETTINGS_KEYS[key])
    return typeof value === 'string' ? value : fallback
  }

  return {
    aboutWhoTitle: readString('ABOUT_WHO_TITLE', DEFAULT_VALUES.aboutWhoTitle),
    aboutWhoDescription: readString('ABOUT_WHO_DESCRIPTION', DEFAULT_VALUES.aboutWhoDescription),
    aboutWhoSecondaryDescription: readString('ABOUT_WHO_SECONDARY_DESCRIPTION', DEFAULT_VALUES.aboutWhoSecondaryDescription),
    aboutWhoFeatures: (() => {
      const val = map.get(SETTINGS_KEYS.ABOUT_WHO_FEATURES)
      if (Array.isArray(val)) return val
      if (typeof val === 'string' && val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed
        } catch { }
      }
      return DEFAULT_VALUES.aboutWhoFeatures
    })(),
    aboutWhoImages: (() => {
      const val = map.get(SETTINGS_KEYS.ABOUT_WHO_IMAGES)
      if (Array.isArray(val)) return val
      if (typeof val === 'string' && val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed
        } catch { }
      }
      return DEFAULT_VALUES.aboutWhoImages
    })(),

    aboutProcessBadge: readString('ABOUT_PROCESS_BADGE', DEFAULT_VALUES.aboutProcessBadge),
    aboutProcessTitle: readString('ABOUT_PROCESS_TITLE', DEFAULT_VALUES.aboutProcessTitle),
    aboutProcessFeatures: (() => {
      const val = map.get(SETTINGS_KEYS.ABOUT_PROCESS_FEATURES)
      if (Array.isArray(val)) return val
      if (typeof val === 'string' && val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed
        } catch { }
      }
      return DEFAULT_VALUES.aboutProcessFeatures
    })(),
    aboutProcessImage: readString('ABOUT_PROCESS_IMAGE', DEFAULT_VALUES.aboutProcessImage),

    aboutMissionTitle: readString('ABOUT_MISSION_TITLE', DEFAULT_VALUES.aboutMissionTitle),
    aboutMissionDesc: readString('ABOUT_MISSION_DESC', DEFAULT_VALUES.aboutMissionDesc),
    aboutVisionTitle: readString('ABOUT_VISION_TITLE', DEFAULT_VALUES.aboutVisionTitle),
    aboutVisionDesc: readString('ABOUT_VISION_DESC', DEFAULT_VALUES.aboutVisionDesc),
    aboutMissionCards: (() => {
      const val = map.get(SETTINGS_KEYS.ABOUT_MISSION_CARDS)
      if (Array.isArray(val)) return val
      if (typeof val === 'string' && val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed
        } catch { }
      }
      return DEFAULT_VALUES.aboutMissionCards
    })(),

    aboutContactBadge: readString('ABOUT_CONTACT_BADGE', DEFAULT_VALUES.aboutContactBadge),
    aboutContactTitle: readString('ABOUT_CONTACT_TITLE', DEFAULT_VALUES.aboutContactTitle),
    aboutContactImage: readString('ABOUT_CONTACT_IMAGE', DEFAULT_VALUES.aboutContactImage),
  }
}

export function AboutMasterPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<any>(DEFAULT_VALUES)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<'who' | 'process' | 'mission' | 'contact'>('who')
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
    mutationFn: (formValues: any) =>
      saveSettings({
        values: formValues,
        currentSettings: data ?? [],
      }),
    onSuccess: () => {
      setToastVariant('success')
      setToastMessage('About content updated successfully.')
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
    mutation.mutate(values)
  }

  const handleValuesChange = (newValues: Partial<any>) => {
    setValues((prev: any) => ({ ...prev, ...newValues }))
  }

  const handleImageChange = async (field: string, file: File | null, index?: number) => {
    if (!file) {
      if (field === 'aboutWhoImages' && typeof index === 'number') {
        const newImages = values.aboutWhoImages.filter((_: any, i: number) => i !== index)
        handleValuesChange({ aboutWhoImages: newImages })
      } else {
        handleValuesChange({ [field]: '' })
      }
      return
    }

    try {
      const uploadId = index !== undefined ? `${field}_${index}` : field
      setUploadingField(uploadId)
      const uploaded = await uploadServicesImage(file)
      if (field === 'aboutWhoImages' && typeof index === 'number') {
        const newImages = [...values.aboutWhoImages]
        newImages[index] = uploaded.absoluteUrl
        handleValuesChange({ aboutWhoImages: newImages })
      } else {
        handleValuesChange({ [field]: uploaded.absoluteUrl })
      }
      setToastVariant('success')
      setToastMessage('Image uploaded successfully.')
      setToastOpen(true)
    } catch (err) {
      setToastVariant('error')
      setToastMessage('Failed to upload image.')
      setToastOpen(true)
    } finally {
      setUploadingField(null)
    }
  }

  if (isPending) return <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4"><Loader size="lg" label="Loading About content..." /></div>

  if (isError) return (
    <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
        <FiInfo className="mx-auto mb-4 text-4xl text-red-600" />
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
            <h1 className="text-lg font-bold text-[var(--ui-text)]">About Page Content</h1>
            <p className="text-xs text-[var(--ui-muted)]">Manage Who We Are, How It Works, Mission & Vision, and Contact CTA sections</p>
          </div>
          <ActionButton type="submit" intent="primary" size="sm" loading={mutation.isPending || uploadingField !== null} leftIcon={<FiCheckCircle />}>Save Changes</ActionButton>
        </div>

        <div className="mx-auto w-full max-w-5xl p-4 md:p-8 space-y-6">
          {/* Section Selector Tab Nav */}
          <div className="flex border-b border-[var(--ui-border)] overflow-x-auto gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('who')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'who'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiInfo /> Who We Are
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
              <FiLayout /> How It Works
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mission')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'mission'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiTarget /> Mission & Vision
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'contact'
                  ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                  : 'border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiMail /> Contact CTA
            </button>
          </div>

          {/* Tab Content: Who We Are */}
          {activeTab === 'who' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-[var(--ui-border)] pb-4 mb-4">
                <h2 className="text-base font-bold text-[var(--ui-text)] flex items-center gap-2">
                  <FiInfo className="text-[var(--ui-primary)]" />
                  Who We Are Content
                </h2>
              </div>

              <Input
                label="Section Title"
                value={values.aboutWhoTitle || ''}
                onChange={(e) => handleValuesChange({ aboutWhoTitle: e.target.value })}
                placeholder="e.g. Who Are We?"
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--ui-text)]">Primary Description</label>
                <div className="rounded-lg border border-[var(--ui-border)] overflow-hidden">
                  <RichTextEditor
                    value={values.aboutWhoDescription || ''}
                    onChange={(content) => handleValuesChange({ aboutWhoDescription: content })}
                    placeholder="Primary paragraph..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--ui-text)]">Secondary Description</label>
                <div className="rounded-lg border border-[var(--ui-border)] overflow-hidden">
                  <RichTextEditor
                    value={values.aboutWhoSecondaryDescription || ''}
                    onChange={(content) => handleValuesChange({ aboutWhoSecondaryDescription: content })}
                    placeholder="Secondary paragraph..."
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--ui-border)]">
                <label className="block text-sm font-bold text-[var(--ui-text)]">Features Checklist List</label>
                {(values.aboutWhoFeatures || []).map((feat: any, index: number) => {
                  const title = typeof feat === 'string' ? feat : (feat?.title || '');
                  const desc = typeof feat === 'string' ? '' : (feat?.desc || '');
                  return (
                  <div key={index} className="flex gap-4 items-start border border-[var(--ui-border)] p-4 rounded-xl bg-slate-50/20">
                    <div className="flex-1 space-y-3">
                      <Input
                        value={title}
                        onChange={(e) => {
                          const newFeatures = [...values.aboutWhoFeatures]
                          const oldFeat = newFeatures[index]
                          const baseObj = typeof oldFeat === 'string' ? {} : oldFeat
                          newFeatures[index] = { ...baseObj, title: e.target.value, desc: desc }
                          handleValuesChange({ aboutWhoFeatures: newFeatures })
                        }}
                        placeholder={`Feature ${index + 1} Title`}
                      />
                      <Input
                        value={desc}
                        onChange={(e) => {
                          const newFeatures = [...values.aboutWhoFeatures]
                          const oldFeat = newFeatures[index]
                          const baseObj = typeof oldFeat === 'string' ? {} : oldFeat
                          newFeatures[index] = { ...baseObj, title: title, desc: e.target.value }
                          handleValuesChange({ aboutWhoFeatures: newFeatures })
                        }}
                        placeholder={`Feature ${index + 1} Description`}
                      />
                    </div>
                    <ActionButton
                      type="button"
                      intent="delete"
                      size="sm"
                      onClick={() => {
                        const newFeatures = values.aboutWhoFeatures.filter((_: any, i: number) => i !== index)
                        handleValuesChange({ aboutWhoFeatures: newFeatures })
                      }}
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </div>
                )})}
                <ActionButton
                  type="button"
                  intent="secondary"
                  className="w-full"
                  leftIcon={<FiPlus />}
                  onClick={() => handleValuesChange({ aboutWhoFeatures: [...(values.aboutWhoFeatures || []), { title: '', desc: '' }] })}
                >Add Feature</ActionButton>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--ui-border)]">
                <label className="block text-sm font-bold text-[var(--ui-text)]">Display Images (Drag & Drop or File Selection)</label>
                <div className="grid gap-4 md:grid-cols-2">
                  {(values.aboutWhoImages || []).map((img: string, index: number) => (
                    <div key={index} className="p-4 border border-[var(--ui-border)] rounded-xl space-y-4 bg-slate-50/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Image #{index + 1}</span>
                        <ActionButton
                          type="button"
                          intent="delete"
                          size="sm"
                          onClick={() => {
                            const newImages = values.aboutWhoImages.filter((_: any, i: number) => i !== index)
                            handleValuesChange({ aboutWhoImages: newImages })
                          }}
                        ><FiTrash2 /></ActionButton>
                      </div>

                      {uploadingField === `aboutWhoImages_${index}` ? (
                        <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-[var(--ui-border)] bg-slate-50/50">
                          <Loader size="md" label="Uploading image..." />
                        </div>
                      ) : (
                        <ImageUploadField
                          label="Display Image"
                          selectedFile={null}
                          existingImageUrl={img}
                          previewAlt={`Display Image ${index + 1}`}
                          onFileChange={(file) => handleImageChange('aboutWhoImages', file, index)}
                          onRemove={() => handleImageChange('aboutWhoImages', null, index)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  className="w-full"
                  leftIcon={<FiPlus />}
                  onClick={() => handleValuesChange({ aboutWhoImages: [...(values.aboutWhoImages || []), ''] })}
                >Add Image Card</ActionButton>
              </div>
            </div>
          )}

          {/* Tab Content: How It Works */}
          {activeTab === 'process' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-[var(--ui-border)] pb-4 mb-4">
                <h2 className="text-base font-bold text-[var(--ui-text)] flex items-center gap-2">
                  <FiLayout className="text-[var(--ui-primary)]" />
                  How It Works Process
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Badge Text"
                  value={values.aboutProcessBadge || ''}
                  onChange={(e) => handleValuesChange({ aboutProcessBadge: e.target.value })}
                  placeholder="e.g. HOW IT WORKS?"
                />
                <Input
                  label="Section Title"
                  value={values.aboutProcessTitle || ''}
                  onChange={(e) => handleValuesChange({ aboutProcessTitle: e.target.value })}
                  placeholder="e.g. Everything you need on creating a business process."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-[var(--ui-border)]">
                <div>
                  {uploadingField === 'aboutProcessImage' ? (
                    <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-[var(--ui-border)] bg-slate-50/50">
                      <Loader size="md" label="Uploading process illustration..." />
                    </div>
                  ) : (
                    <ImageUploadField
                      label="Process Illustration Image"
                      selectedFile={null}
                      existingImageUrl={values.aboutProcessImage}
                      previewAlt="Process Illustration"
                      onFileChange={(file) => handleImageChange('aboutProcessImage', file)}
                      onRemove={() => handleImageChange('aboutProcessImage', null)}
                    />
                  )}
                </div>
                <div className="flex flex-col justify-end">
                  <Input
                    label="Illustration Fallback Image URL (Optional)"
                    value={values.aboutProcessImage || ''}
                    onChange={(e) => handleValuesChange({ aboutProcessImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--ui-border)]">
                <label className="block text-sm font-bold text-[var(--ui-text)]">Process Flow Steps</label>
                <div className="grid gap-4 md:grid-cols-3">
                  {(values.aboutProcessFeatures || []).map((item: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-50/30 border border-[var(--ui-border)] rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Step {index + 1}</span>
                        <ActionButton
                          type="button"
                          intent="delete"
                          size="sm"
                          onClick={() => {
                            const newItems = values.aboutProcessFeatures.filter((_: any, i: number) => i !== index)
                            handleValuesChange({ aboutProcessFeatures: newItems })
                          }}
                        >
                          <FiTrash2 />
                        </ActionButton>
                      </div>

                      <Input
                        label="Step Title"
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...values.aboutProcessFeatures]
                          newItems[index] = { ...item, title: e.target.value }
                          handleValuesChange({ aboutProcessFeatures: newItems })
                        }}
                        placeholder="Collect Ideas"
                      />

                      <div className="grid gap-1.5">
                        <span className="text-sm font-semibold text-[var(--ui-text)]">Icon Code Name</span>
                        <Dropdown
                          showSearch={true}
                          searchPlaceholder="Search icon..."
                          options={getIconOptions(item.icon)}
                          value={item.icon || 'FiLightbulb'}
                          onChange={(value) => {
                            const newItems = [...values.aboutProcessFeatures]
                            newItems[index] = { ...item, icon: value }
                            handleValuesChange({ aboutProcessFeatures: newItems })
                          }}
                        />
                      </div>

                      <Input
                        label="Description"
                        value={item.desc}
                        onChange={(e) => {
                          const newItems = [...values.aboutProcessFeatures]
                          newItems[index] = { ...item, desc: e.target.value }
                          handleValuesChange({ aboutProcessFeatures: newItems })
                        }}
                        placeholder="Step description..."
                      />
                    </div>
                  ))}
                </div>
                <ActionButton
                  type="button"
                  intent="secondary"
                  className="w-full"
                  leftIcon={<FiPlus />}
                  onClick={() => handleValuesChange({
                    aboutProcessFeatures: [
                      ...(values.aboutProcessFeatures || []),
                      { title: '', desc: '', icon: 'FiLightbulb' }
                    ]
                  })}
                >Add Step</ActionButton>
              </div>
            </div>
          )}

          {/* Tab Content: Mission & Vision */}
          {activeTab === 'mission' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-[var(--ui-border)] pb-4 mb-4">
                <h2 className="text-base font-bold text-[var(--ui-text)] flex items-center gap-2">
                  <FiTarget className="text-[var(--ui-primary)]" />
                  Mission & Vision Statements
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 p-4 border border-[var(--ui-border)] rounded-xl bg-slate-50/10">
                  <Input
                    label="Mission Section Title"
                    value={values.aboutMissionTitle || ''}
                    onChange={(e) => handleValuesChange({ aboutMissionTitle: e.target.value })}
                    placeholder="Our Mission"
                  />
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[var(--ui-text)]">Mission Description</label>
                    <textarea
                      className="w-full rounded-lg border border-[var(--ui-border)] p-3 text-sm focus:border-[var(--ui-primary)] focus:ring-1 focus:ring-[var(--ui-primary)] outline-none min-h-[100px] bg-white text-[var(--ui-text)]"
                      rows={4}
                      value={values.aboutMissionDesc || ''}
                      onChange={(e) => handleValuesChange({ aboutMissionDesc: e.target.value })}
                      placeholder="Mission description..."
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-[var(--ui-border)] rounded-xl bg-slate-50/10">
                  <Input
                    label="Vision Section Title"
                    value={values.aboutVisionTitle || ''}
                    onChange={(e) => handleValuesChange({ aboutVisionTitle: e.target.value })}
                    placeholder="Our Vision"
                  />
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[var(--ui-text)]">Vision Description</label>
                    <textarea
                      className="w-full rounded-lg border border-[var(--ui-border)] p-3 text-sm focus:border-[var(--ui-primary)] focus:ring-1 focus:ring-[var(--ui-primary)] outline-none min-h-[100px] bg-white text-[var(--ui-text)]"
                      rows={4}
                      value={values.aboutVisionDesc || ''}
                      onChange={(e) => handleValuesChange({ aboutVisionDesc: e.target.value })}
                      placeholder="Vision description..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--ui-border)]">
                <label className="block text-sm font-bold text-[var(--ui-text)]">Performance Statistics Cards</label>
                <div className="grid gap-4 sm:grid-cols-4">
                  {(values.aboutMissionCards || []).map((card: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-50/20 border border-[var(--ui-border)] rounded-xl space-y-3">
                      <span className="text-xs font-bold text-slate-400">Card {index + 1}</span>
                      <Input
                        label="Value (Large Text)"
                        value={card.value}
                        onChange={(e) => {
                          const newCards = [...values.aboutMissionCards]
                          newCards[index] = { ...newCards[index], value: e.target.value }
                          handleValuesChange({ aboutMissionCards: newCards })
                        }}
                        placeholder="e.g. 50+"
                      />
                      <Input
                        label="Label (Small Text)"
                        value={card.label}
                        onChange={(e) => {
                          const newCards = [...values.aboutMissionCards]
                          newCards[index] = { ...newCards[index], label: e.target.value }
                          handleValuesChange({ aboutMissionCards: newCards })
                        }}
                        placeholder="e.g. Active Projects"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Contact CTA */}
          {activeTab === 'contact' && (
            <div className="rounded-2xl border border-[var(--ui-border)] bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-[var(--ui-border)] pb-4 mb-4">
                <h2 className="text-base font-bold text-[var(--ui-text)] flex items-center gap-2">
                  <FiMail className="text-[var(--ui-primary)]" />
                  Contact CTA Settings
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="CTA Badge Text"
                  value={values.aboutContactBadge || ''}
                  onChange={(e) => handleValuesChange({ aboutContactBadge: e.target.value })}
                  placeholder="e.g. GET IN TOUCH"
                />
                <Input
                  label="CTA Section Title"
                  value={values.aboutContactTitle || ''}
                  onChange={(e) => handleValuesChange({ aboutContactTitle: e.target.value })}
                  placeholder="e.g. Got any questions? Don't hesitate to get in touch."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-[var(--ui-border)]">
                <div>
                  {uploadingField === 'aboutContactImage' ? (
                    <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-[var(--ui-border)] bg-slate-50/50">
                      <Loader size="md" label="Uploading contact illustration..." />
                    </div>
                  ) : (
                    <ImageUploadField
                      label="Contact Illustration Image"
                      selectedFile={null}
                      existingImageUrl={values.aboutContactImage}
                      previewAlt="Contact Illustration"
                      onFileChange={(file) => handleImageChange('aboutContactImage', file)}
                      onRemove={() => handleImageChange('aboutContactImage', null)}
                    />
                  )}
                </div>
                <div className="flex flex-col justify-end">
                  <Input
                    label="Illustration Fallback Image URL (Optional)"
                    value={values.aboutContactImage || ''}
                    onChange={(e) => handleValuesChange({ aboutContactImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
