import { FiEdit2, FiImage, FiTrash2 } from 'react-icons/fi'
import type { BlogMasterItem } from '../../../../types/blogsMaster'
import { getAbsoluteImageUrl } from '../../../../utils/image'

type BlogsMasterCardProps = {
  blog: BlogMasterItem
  onEdit?: (item: BlogMasterItem) => void
  onDelete?: (itemId: string) => void
}

function plainTextFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatPublishedAt(value: string | null) {
  if (!value) {
    return 'Unscheduled'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function BlogsMasterCard({ blog, onEdit, onDelete }: BlogsMasterCardProps) {
  return (
    <article className="group flex flex-row gap-3 sm:gap-4 rounded-xl border border-[var(--ui-border)] bg-white p-3 sm:p-4 shadow-sm transition-all hover:shadow-md">
      <div className="size-20 sm:h-24 sm:w-32 shrink-0 overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
        {blog.imageUrl ? (
          <img src={getAbsoluteImageUrl(blog.imageUrl)} alt={blog.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-[var(--ui-muted)]">
            <FiImage size={18} className="sm:h-5 sm:w-5" />
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">No image</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold leading-tight text-[var(--ui-text)]">{blog.title}</h3>

          <div className="flex shrink-0 items-center gap-0.5 -mt-1 -mr-1">
            <button
              type="button"
              onClick={() => onEdit?.(blog)}
              className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Edit blog"
              title="Edit blog"
            >
              <FiEdit2 size={16} className="sm:h-[18px] sm:w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(blog.id)}
              className="rounded-md p-1.5 sm:p-2 text-[var(--ui-muted)] transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              aria-label="Delete blog"
              title="Delete blog"
            >
              <FiTrash2 size={16} className="sm:h-[18px] sm:w-[18px]" />
            </button>
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[var(--ui-muted)]">
          <span className="rounded bg-[var(--ui-surface-muted)] px-1.5 py-0.5 font-mono">/{blog.slug}</span>
          <span className="hidden sm:inline">|</span>
          <span className="uppercase">{blog.status}</span>
        </div>

        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--ui-text)] opacity-80 line-clamp-2">
          {plainTextFromHtml(blog.content)}
        </p>

        <div className="mt-2 sm:mt-auto sm:pt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded bg-[var(--ui-primary-soft)] px-2 py-0.5 font-medium text-[var(--ui-primary-strong)]">
            {blog.featured ? 'Featured' : 'Not featured'}
          </span>
          <span className="rounded bg-[var(--ui-surface-muted)] px-2 py-0.5 text-[var(--ui-muted)]">{blog.category ?? 'No category'}</span>
          <span className="text-[var(--ui-muted)]">Published: {formatPublishedAt(blog.publishedAt)}</span>
        </div>
      </div>
    </article>
  )
}
