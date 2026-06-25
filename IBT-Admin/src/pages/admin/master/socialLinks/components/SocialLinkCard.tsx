import { FiEdit2, FiMove, FiTrash2 } from 'react-icons/fi'
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
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { SocialLinkMasterItem } from '../../../../../types/socialLinksMaster'
import { getAbsoluteImageUrl } from '../../../../../utils/image'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FaFacebookF,
  twitter: FaTwitter,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  youtube: FaYoutube,
  github: FaGithub,
  whatsapp: FaWhatsapp,
  discord: FaDiscord,
  telegram: FaTelegramPlane,
  tiktok: FaTiktok,
  pinterest: FaPinterestP,
  reddit: FaRedditAlien,
  twitch: FaTwitch,
  website: FaGlobe,
}

type SocialLinkCardProps = {
  link: SocialLinkMasterItem
  mode: 'manage' | 'reorder'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: SyntheticListenerMap
  }
  onEdit?: (item: SocialLinkMasterItem) => void
  onDelete?: (itemId: string) => void
}

export function SocialLinkCard({
  link,
  mode,
  dragHandleProps,
  onEdit,
  onDelete,
}: SocialLinkCardProps) {
  return (
    <article className="group flex items-start gap-3 rounded-xl border border-[var(--ui-border)] bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {mode === 'reorder' ? (
        <button
          type="button"
          className="mt-1 cursor-grab rounded-md p-1 text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)] active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...(dragHandleProps?.attributes ?? {})}
          {...(dragHandleProps?.listeners ?? {})}
        >
          <FiMove size={18} />
        </button>
      ) : null}

      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
        {link.logoUrl ? (
          (() => {
            const isIconKey = !link.logoUrl.includes('/') && !link.logoUrl.startsWith('http')
            if (isIconKey) {
              const Icon = ICON_MAP[link.logoUrl.toLowerCase()] || FaGlobe
              return <Icon className="h-6 w-6 text-[var(--ui-primary)]" />
            }
            return <img src={getAbsoluteImageUrl(link.logoUrl)} alt={link.platform} className="h-full w-full object-contain p-1" />
          })()
        ) : (
          <span className="text-xs font-medium text-[var(--ui-muted)]">No Logo</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-[var(--ui-text)]">{link.platform}</p>
            {link.url ? (
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 line-clamp-1 text-xs text-[var(--ui-primary)] hover:underline">
                {link.url}
              </a>
            ) : null}
          </div>

          {mode === 'manage' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit?.(link)}
                aria-label="Edit link"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                type="button"
                className="rounded-md p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete?.(link.id)}
                aria-label="Delete link"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="text-xs text-[var(--ui-muted)]">Order #{link.order}</div>
      </div>
    </article>
  )
}
