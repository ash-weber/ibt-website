import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiX } from 'react-icons/fi'
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaYoutube, 
  FaGithub, 
  FaWhatsapp, 
  FaDiscord, 
  FaTelegramPlane, 
  FaTiktok, 
  FaPinterestP, 
  FaRedditAlien, 
  FaTwitch, 
  FaGlobe 
} from 'react-icons/fa'
import { ActionButton, Input, Dropdown } from '../../../../../component'

const schema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Must be a valid URL'),
  logoUrl: z.string().min(1, 'Icon selection is required'),
})

export const ICON_OPTIONS = [
  { label: 'Facebook', value: 'facebook', icon: <FaFacebookF /> },
  { label: 'Twitter / X', value: 'twitter', icon: <FaTwitter /> },
  { label: 'LinkedIn', value: 'linkedin', icon: <FaLinkedinIn /> },
  { label: 'Instagram', value: 'instagram', icon: <FaInstagram /> },
  { label: 'YouTube', value: 'youtube', icon: <FaYoutube /> },
  { label: 'GitHub', value: 'github', icon: <FaGithub /> },
  { label: 'WhatsApp', value: 'whatsapp', icon: <FaWhatsapp /> },
  { label: 'Discord', value: 'discord', icon: <FaDiscord /> },
  { label: 'Telegram', value: 'telegram', icon: <FaTelegramPlane /> },
  { label: 'TikTok', value: 'tiktok', icon: <FaTiktok /> },
  { label: 'Pinterest', value: 'pinterest', icon: <FaPinterestP /> },
  { label: 'Reddit', value: 'reddit', icon: <FaRedditAlien /> },
  { label: 'Twitch', value: 'twitch', icon: <FaTwitch /> },
  { label: 'Website / Link', value: 'website', icon: <FaGlobe /> },
]

export type SocialLinkCreateEditFormValues = z.infer<typeof schema>

type SocialLinkCreateEditModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialValues: SocialLinkCreateEditFormValues
  submitting: boolean
  onClose: () => void
  onSubmit: (values: SocialLinkCreateEditFormValues) => void
}

export function SocialLinkCreateEditModal({
  isOpen,
  mode,
  initialValues,
  submitting,
  onClose,
  onSubmit,
}: SocialLinkCreateEditModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SocialLinkCreateEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
    }
  }, [isOpen, initialValues, reset])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--ui-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--ui-text)]">
            {mode === 'create' ? 'Add Social Link' : 'Edit Social Link'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)]"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit(values))} className="p-6">
          <div className="space-y-5">
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ui-text)]">Select Icon</label>
                  <Dropdown
                    options={ICON_OPTIONS}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      const matched = ICON_OPTIONS.find((o) => o.value === val)
                      if (matched) {
                        setValue('platform', matched.label, { shouldValidate: true })
                      }
                    }}
                    placeholder="Choose a social platform icon"
                  />
                  {errors.logoUrl && (
                    <p className="text-xs font-medium text-[var(--ui-danger)]">{errors.logoUrl.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <Input
                  label="Platform Name"
                  placeholder="e.g. LinkedIn, Twitter"
                  error={errors.platform?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  label="Profile URL"
                  placeholder="https://..."
                  error={errors.url?.message}
                  {...field}
                />
              )}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-[var(--ui-border)] pt-5">
            <ActionButton type="button" intent="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" intent="primary" loading={submitting}>
              {mode === 'create' ? 'Create Link' : 'Save Changes'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  )
}
