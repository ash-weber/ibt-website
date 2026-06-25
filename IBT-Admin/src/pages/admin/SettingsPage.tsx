import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FiAlertTriangle, FiRefreshCw, FiSave } from 'react-icons/fi'
import { getSettings, saveSettings } from '../../api/settings'
import { ActionButton, Input, Loader, Toast } from '../../component'
import { useSocketSettings } from '../../providers/SocketSettingsProvider'
import { settingsSchema, type SettingsSchema } from '../../features/settings/validation'
import { SETTINGS_KEYS, type SettingEntity, type SettingsFormValues } from '../../types/settings'

type FieldErrors = Partial<Record<keyof SettingsSchema, string>>

type ApiError = {
  message?: string
}

const SETTINGS_QUERY_KEY = ['settings']

const DEFAULT_VALUES: any = {
  maintenanceMode: false,
  maintenanceMessage: 'We are currently under maintenance. Please check back soon.',
  maintenanceEndTime: (() => {
    const date = new Date(Date.now() + 60 * 60 * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  })(),
  whatsappNumber: '',
  internshipHeroTitle: '',
  internshipHeroSubtitle: '',
  internshipHeroDescription: '',
  internshipHeroImageUrl: '',
  internshipIntroTitle: '',
  internshipIntroDescription: '',
  internshipApproachTitle: '',
  internshipApproachDescription: '',
  internshipCardOneValue: '',
  internshipCardOneTitle: '',
  internshipCardOneDescription: '',
  internshipCardTwoValue: '',
  internshipCardTwoTitle: '',
  internshipCardTwoDescription: '',
  internshipCardThreeValue: '',
  internshipCardThreeTitle: '',
  internshipCardThreeDescription: '',
  internshipGalleryTitle: '',
  internshipGalleryImageUrls: '[]',
  internshipTestimonialsTitle: '',
  internshipClosingTitle: '',
  internshipClosingContent: '',
  internshipApplyEmail: '',
  adminNotificationEmail: '',
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  homeVideoUrl: '',
  homeVideoEnabled: false,
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return DEFAULT_VALUES.maintenanceEndTime
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function settingsToForm(settings: SettingEntity[]): any {
  const map = new Map(settings.map((item) => [item.key, item.value]))

  const rawMaintenanceMode = map.get(SETTINGS_KEYS.MAINTENANCE_MODE)
  const rawMaintenanceMessage = map.get(SETTINGS_KEYS.MAINTENANCE_MESSAGE)
  const rawMaintenanceEndTime = map.get(SETTINGS_KEYS.MAINTENANCE_END_TIME)

  const endTimeIso = typeof rawMaintenanceEndTime === 'string' && !Number.isNaN(Date.parse(rawMaintenanceEndTime))
    ? toDateTimeLocalValue(rawMaintenanceEndTime)
    : DEFAULT_VALUES.maintenanceEndTime

  const readString = (key: keyof typeof SETTINGS_KEYS, fallback: string) => {
    const value = map.get(SETTINGS_KEYS[key])
    return typeof value === 'string' ? value : fallback
  }

  return {
    maintenanceMode: typeof rawMaintenanceMode === 'boolean' ? rawMaintenanceMode : DEFAULT_VALUES.maintenanceMode,
    maintenanceMessage: typeof rawMaintenanceMessage === 'string' ? rawMaintenanceMessage : DEFAULT_VALUES.maintenanceMessage,
    maintenanceEndTime: endTimeIso,
    whatsappNumber: readString('WHATSAPP_NUMBER', DEFAULT_VALUES.whatsappNumber),
    internshipHeroTitle: readString('INTERNSHIP_HERO_TITLE', DEFAULT_VALUES.internshipHeroTitle),
    internshipHeroSubtitle: readString('INTERNSHIP_HERO_SUBTITLE', DEFAULT_VALUES.internshipHeroSubtitle),
    internshipHeroDescription: readString('INTERNSHIP_HERO_DESCRIPTION', DEFAULT_VALUES.internshipHeroDescription),
    internshipHeroImageUrl: readString('INTERNSHIP_HERO_IMAGE_URL', DEFAULT_VALUES.internshipHeroImageUrl),
    internshipIntroTitle: readString('INTERNSHIP_INTRO_TITLE', DEFAULT_VALUES.internshipIntroTitle),
    internshipIntroDescription: readString('INTERNSHIP_INTRO_DESCRIPTION', DEFAULT_VALUES.internshipIntroDescription),
    internshipApproachTitle: readString('INTERNSHIP_APPROACH_TITLE', DEFAULT_VALUES.internshipApproachTitle),
    internshipApproachDescription: readString('INTERNSHIP_APPROACH_DESCRIPTION', DEFAULT_VALUES.internshipApproachDescription),
    internshipCardOneValue: readString('INTERNSHIP_CARD_ONE_VALUE', DEFAULT_VALUES.internshipCardOneValue),
    internshipCardOneTitle: readString('INTERNSHIP_CARD_ONE_TITLE', DEFAULT_VALUES.internshipCardOneTitle),
    internshipCardOneDescription: readString('INTERNSHIP_CARD_ONE_DESCRIPTION', DEFAULT_VALUES.internshipCardOneDescription),
    internshipCardTwoValue: readString('INTERNSHIP_CARD_TWO_VALUE', DEFAULT_VALUES.internshipCardTwoValue),
    internshipCardTwoTitle: readString('INTERNSHIP_CARD_TWO_TITLE', DEFAULT_VALUES.internshipCardTwoTitle),
    internshipCardTwoDescription: readString('INTERNSHIP_CARD_TWO_DESCRIPTION', DEFAULT_VALUES.internshipCardTwoDescription),
    internshipCardThreeValue: readString('INTERNSHIP_CARD_THREE_VALUE', DEFAULT_VALUES.internshipCardThreeValue),
    internshipCardThreeTitle: readString('INTERNSHIP_CARD_THREE_TITLE', DEFAULT_VALUES.internshipCardThreeTitle),
    internshipCardThreeDescription: readString('INTERNSHIP_CARD_THREE_DESCRIPTION', DEFAULT_VALUES.internshipCardThreeDescription),
    internshipGalleryTitle: readString('INTERNSHIP_GALLERY_TITLE', DEFAULT_VALUES.internshipGalleryTitle),
    internshipGalleryImageUrls: readString('INTERNSHIP_GALLERY_IMAGE_URLS', DEFAULT_VALUES.internshipGalleryImageUrls),
    internshipTestimonialsTitle: readString('INTERNSHIP_TESTIMONIALS_TITLE', DEFAULT_VALUES.internshipTestimonialsTitle),
    internshipClosingTitle: readString('INTERNSHIP_CLOSING_TITLE', DEFAULT_VALUES.internshipClosingTitle),
    internshipClosingContent: readString('INTERNSHIP_CLOSING_CONTENT', DEFAULT_VALUES.internshipClosingContent),
    internshipApplyEmail: readString('INTERNSHIP_APPLY_EMAIL', DEFAULT_VALUES.internshipApplyEmail),
    adminNotificationEmail: readString('ADMIN_NOTIFICATION_EMAIL', DEFAULT_VALUES.adminNotificationEmail),
    smtpHost: readString('SMTP_HOST', DEFAULT_VALUES.smtpHost),
    smtpPort: readString('SMTP_PORT', DEFAULT_VALUES.smtpPort),
    smtpUser: readString('SMTP_USER', DEFAULT_VALUES.smtpUser),
    smtpPass: readString('SMTP_PASS', DEFAULT_VALUES.smtpPass),
    smtpFrom: readString('SMTP_FROM', DEFAULT_VALUES.smtpFrom),
    homeVideoUrl: readString('HOME_VIDEO_URL', DEFAULT_VALUES.homeVideoUrl),
    homeVideoEnabled: map.get(SETTINGS_KEYS.HOME_VIDEO_ENABLED) === true,
  }
}

const settingsPageSchema = settingsSchema.pick({
  maintenanceMode: true,
  maintenanceMessage: true,
  maintenanceEndTime: true,
  whatsappNumber: true,
  adminNotificationEmail: true,
  smtpHost: true,
  smtpPort: true,
  smtpUser: true,
  smtpPass: true,
  smtpFrom: true,
  homeVideoUrl: true,
  homeVideoEnabled: true,
})

function mapValidationErrors(values: any) {
  const result = settingsPageSchema.safeParse(values)

  if (result.success) {
    return { valid: true as const, errors: {} as FieldErrors }
  }

  const flattened = result.error.flatten().fieldErrors
  const nextErrors: FieldErrors = {}

  for (const key of Object.keys(flattened) as Array<keyof SettingsSchema>) {
    const message = (flattened as Record<string, string[] | undefined>)[key as string]?.[0]
    if (message) {
      nextErrors[key] = message
    }
  }

  return {
    valid: false as const,
    errors: nextErrors,
  }
}

function mergeSettingsByKey(existing: SettingEntity[], updates: SettingEntity[]) {
  const nextMap = new Map(existing.map((item) => [item.key, item]))

  for (const updated of updates) {
    nextMap.set(updated.key, updated)
  }

  return Array.from(nextMap.values())
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { connection } = useSocketSettings()
  const [values, setValues] = useState<SettingsFormValues>(DEFAULT_VALUES)
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
    mutationFn: (formValues: SettingsFormValues) =>
      saveSettings({
        values: formValues,
        currentSettings: data ?? [],
      }),
    onSuccess: (updatedSettings) => {
      if (updatedSettings.length > 0) {
        queryClient.setQueryData<SettingEntity[]>(SETTINGS_QUERY_KEY, (previous = []) =>
          mergeSettingsByKey(previous, updatedSettings),
        )

        const cached = queryClient.getQueryData<SettingEntity[]>(SETTINGS_QUERY_KEY)
        if (cached) {
          setValues(settingsToForm(cached))
        }

        setToastVariant('success')
        setToastMessage('Settings updated successfully.')
        setToastOpen(true)
        return
      }

      setToastVariant('success')
      setToastMessage('No changes to save.')
      setToastOpen(true)
    },
    onError: (err) => {
      const axiosError = err as AxiosError<ApiError>
      setToastVariant('error')
      setToastMessage(axiosError.response?.data?.message ?? 'Failed to update settings.')
      setToastOpen(true)
    },
  })

  const backendErrorMessage = useMemo(() => {
    if (!isError) {
      return ''
    }

    const axiosError = error as AxiosError<ApiError>
    return axiosError.response?.data?.message ?? 'Unable to load settings.'
  }, [error, isError])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validation = mapValidationErrors(values)

    if (!validation.valid) {
      setErrors(validation.errors)
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
        <div className="rounded-(--ui-radius-lg) border border-(--ui-border) bg-white px-6 py-5 shadow-(--ui-shadow-md)">
          <div className="flex items-center gap-3">
            <Loader size="lg" label="Loading settings" />
            <p className="text-sm font-semibold text-(--ui-muted)">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4">
        <div className="w-full max-w-xl rounded-(--ui-radius-lg) border border-red-200 bg-red-50 p-8 text-center shadow-(--ui-shadow-md)">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle />
          </div>
          <p className="text-base font-semibold text-red-800">Could not load settings</p>
          <p className="mt-1 text-sm text-red-700">{backendErrorMessage}</p>
          <div className="mt-5 flex justify-center">
            <ActionButton intent="secondary" onClick={() => refetch()} leftIcon={<FiRefreshCw />}>
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
        title={toastVariant === 'success' ? 'Settings Saved' : 'Settings Error'}
        onClose={() => setToastOpen(false)}
      />

      <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col">
        <div className="mx-auto w-full flex-1">
          <div className="space-y-6 p-5 md:p-6">
            <div className="rounded-(--ui-radius-md) border border-(--ui-border) bg-(--ui-surface-muted) px-4 py-3 text-sm text-(--ui-text)">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Realtime settings sync</p>
                  <p className="text-xs text-(--ui-muted)">
                    {connection.connected
                      ? 'Connected to the Socket.IO stream.'
                      : connection.connecting
                        ? 'Connecting to realtime settings...'
                        : 'Realtime updates are offline.'}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-(--ui-muted) shadow-sm">
                  {connection.connected ? 'Live' : connection.status}
                </span>
              </div>
            </div>

            <div className="rounded-(--ui-radius-md) border border-(--ui-border) p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-(--ui-text)">Maintenance Mode</p>
                  <p className="text-xs text-(--ui-muted)">When enabled, public users will see your maintenance message.</p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-(--ui-primary)"
                    checked={values.maintenanceMode}
                    onChange={(event) => setValue('maintenanceMode', event.target.checked)}
                  />
                  <span className="text-sm font-medium text-(--ui-text)">
                    {values.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            <label className="grid gap-1.5" htmlFor="maintenance-message">
              <span className="text-sm font-semibold text-(--ui-text)">Maintenance Message</span>
              <textarea
                id="maintenance-message"
                value={values.maintenanceMessage}
                onChange={(event) => setValue('maintenanceMessage', event.target.value)}
                placeholder="We are currently under maintenance. Please check back soon."
                maxLength={255}
                rows={4}
                className="w-full resize-y rounded-lg border border-(--ui-border) bg-white px-3 py-2.5 text-sm text-(--ui-text) outline-none transition-colors placeholder:text-(--ui-muted) focus:border-(--ui-primary)"
              />
              {errors.maintenanceMessage ? (
                <span className="text-xs font-medium text-(--ui-danger)">{errors.maintenanceMessage}</span>
              ) : (
                <span className="text-xs text-(--ui-muted)">
                  Shown to users when maintenance mode is on. {values.maintenanceMessage.length}/255
                </span>
              )}
            </label>

            <Input
              label="Maintenance End Time"
              type="datetime-local"
              value={values.maintenanceEndTime}
              onChange={(event) => setValue('maintenanceEndTime', event.target.value)}
              error={errors.maintenanceEndTime}
              helperText="Use your local timezone."
            />

            <Input
              label="WhatsApp Number"
              type="text"
              value={values.whatsappNumber}
              onChange={(event) => setValue('whatsappNumber', event.target.value)}
              placeholder="+91 98765 43210"
              error={errors.whatsappNumber}
              helperText="Enter the number with country code for the floating button."
            />

            {/* <div className="pt-4 border-t border-(--ui-border)">
              <h3 className="text-lg font-semibold text-(--ui-text) mb-4">Home Video Settings</h3>
              <div className="space-y-4">
                <div className="rounded-(--ui-radius-md) border border-(--ui-border) p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-(--ui-text)">Enable Home Video</p>
                      <p className="text-xs text-(--ui-muted)">When enabled, a video will play first on the home page.</p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-(--ui-primary)"
                        checked={values.homeVideoEnabled}
                        onChange={(event) => setValue('homeVideoEnabled', event.target.checked)}
                      />
                      <span className="text-sm font-medium text-(--ui-text)">
                        {values.homeVideoEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <Input
                  label="Home Video URL"
                  type="text"
                  value={values.homeVideoUrl}
                  onChange={(event) => setValue('homeVideoUrl', event.target.value)}
                  placeholder="https://example.com/video.mp4 or YouTube Link"
                  error={errors.homeVideoUrl}
                  helperText="A direct link to an MP4 video file or a YouTube link. This video will play when users land on the home page."
                />
              </div>
            </div> */}

            <Input
              label="Admin Notification Email"
              type="text"
              value={values.adminNotificationEmail}
              onChange={(event) => setValue('adminNotificationEmail', event.target.value)}
              placeholder="admin1@example.com, admin2@example.com"
              error={errors.adminNotificationEmail}
              helperText="Comma-separated emails. All system notifications and contact form updates will be sent here."
            />

            <div className="pt-4 border-t border-(--ui-border)">
              <h3 className="text-lg font-semibold text-(--ui-text) mb-4">Email Configuration (SMTP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="SMTP Host"
                  type="text"
                  value={values.smtpHost}
                  onChange={(event) => setValue('smtpHost', event.target.value)}
                  placeholder="smtp.gmail.com"
                  error={errors.smtpHost}
                />
                <Input
                  label="SMTP Port"
                  type="text"
                  value={values.smtpPort}
                  onChange={(event) => setValue('smtpPort', event.target.value)}
                  placeholder="587"
                  error={errors.smtpPort}
                />
                <Input
                  label="SMTP Username"
                  type="text"
                  value={values.smtpUser}
                  onChange={(event) => setValue('smtpUser', event.target.value)}
                  placeholder="your.email@gmail.com"
                  error={errors.smtpUser}
                />
                <Input
                  label="SMTP App Password"
                  type="password"
                  value={values.smtpPass}
                  onChange={(event) => setValue('smtpPass', event.target.value)}
                  placeholder="********"
                  error={errors.smtpPass}
                />
                <Input
                  label="'From' Email Address"
                  type="email"
                  value={values.smtpFrom}
                  onChange={(event) => setValue('smtpFrom', event.target.value)}
                  placeholder="your.email@gmail.com"
                  error={errors.smtpFrom}
                  helperText="The email address that will appear as the sender."
                />
              </div>
            </div>


          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-(--ui-border) bg-white/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <ActionButton
              type="button"
              intent="ghost"
              onClick={handleReset}
              disabled={mutation.isPending}
              leftIcon={<FiRefreshCw />}
            >
              Reset Changes
            </ActionButton>

            <ActionButton
              type="submit"
              intent="primary"
              loading={mutation.isPending}
              leftIcon={<FiSave />}
              disabled={mutation.isPending}
            >
              Save Settings
            </ActionButton>
          </div>
        </div>
      </form>
    </div>
  )
}
