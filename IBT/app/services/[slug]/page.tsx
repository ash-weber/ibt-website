import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { apiClient } from '@/src/api/client'

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const services = await apiClient.getServices(1, 100);
    const paths = services.items.map((service) => ({
      slug: service.slug,
    }));
    return paths.length > 0 ? paths : [{ slug: 'overview' }];
  } catch (error) {
    console.error('Error generating static params for services:', error);
    return [{ slug: 'overview' }];
  }
}

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>
}

const resolveApiOrigin = (value: string | undefined) => {
  const fallback = 'http://localhost:5000'

  if (!value?.trim()) {
    return fallback
  }

  const withProtocol = /^https?:\/\//i.test(value.trim()) ? value.trim() : `http://${value.trim()}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return fallback
  }
}

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl?.trim()) {
    return null
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${resolveApiOrigin(process.env.NEXT_PUBLIC_API_URL)}${imageUrl}`
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params
  const service = await apiClient.getServiceBySlug(slug).catch(() => null)

  if (!service) {
    notFound()
  }

  const imageSrc = resolveImageUrl(service.imageUrl)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/services"
          className="group inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-(--ui-primary)"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back to Services
        </Link>
      </div>

      <article className="overflow-hidden rounded-3xl border border-(--ui-border) bg-white shadow-[0_14px_36px_rgba(35,24,21,0.06)]">
        <div className="relative aspect-[16/7] w-full bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100">
          {imageSrc ? (
            service.projectUrl ? (
              <a href={service.projectUrl} target="_blank" rel="noopener noreferrer" className="block max-h-full max-w-full">
                <img src={imageSrc} alt={service.title} className="max-h-full max-w-full object-contain hover:opacity-90 transition-opacity" />
              </a>
            ) : (
              <img src={imageSrc} alt={service.title} className="max-h-full max-w-full object-contain" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-(--ui-muted)">
              No service cover image
            </div>
          )}
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--ui-primary)">Service</p>
          <h1 className="text-[36px] sm:text-[44px] lg:text-[54px] font-black leading-[1.15] text-slate-900">{service.title}</h1>
          <div 
            className="text-base leading-8 text-slate-500 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        </div>
      </article>
    </div>
  )
}
