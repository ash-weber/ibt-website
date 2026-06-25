import type { DashboardTrendPoint } from '../../../../types/dashboard'

type DashboardStatusPanelsProps = {
  blogsByStatus: {
    DRAFT: number
    PUBLISHED: number
    ARCHIVED: number
  }
  labProjectsByStatus: {
    ONGOING: number
    COMPLETED: number
    ARCHIVED: number
  }
  trends: DashboardTrendPoint[]
}

const buildLinePath = (values: number[], width: number, height: number, left: number, top: number, max: number) => {
  const plotWidth = width - left * 2
  const plotHeight = height - top * 2

  if (values.length === 0) {
    return ''
  }

  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0

  return values
    .map((value, index) => {
      const x = left + index * step
      const y = top + (max > 0 ? plotHeight - (value / max) * plotHeight : plotHeight)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export function DashboardStatusPanels({ blogsByStatus, labProjectsByStatus, trends }: DashboardStatusPanelsProps) {
  const trendPoints = trends.length > 0 ? trends : [{ date: '', label: 'Today', blogsCreated: 0, projectsCreated: 0, totalCreated: 0 }]
  const blogsLine = trendPoints.map((item) => item.blogsCreated)
  const projectsLine = trendPoints.map((item) => item.projectsCreated)
  const maxValue = Math.max(...blogsLine, ...projectsLine, 1)

  const chartWidth = 760
  const chartHeight = 280
  const padX = 40
  const padY = 24

  const blogsPath = buildLinePath(blogsLine, chartWidth, chartHeight, padX, padY, maxValue)
  const projectsPath = buildLinePath(projectsLine, chartWidth, chartHeight, padX, padY, maxValue)

  const blogTotal = blogsLine.reduce((sum, value) => sum + value, 0)
  const projectTotal = projectsLine.reduce((sum, value) => sum + value, 0)

  const publishedShare = blogsByStatus.PUBLISHED + blogsByStatus.DRAFT + blogsByStatus.ARCHIVED > 0
    ? Math.round((blogsByStatus.PUBLISHED / (blogsByStatus.PUBLISHED + blogsByStatus.DRAFT + blogsByStatus.ARCHIVED)) * 100)
    : 0
  const completedShare = labProjectsByStatus.COMPLETED + labProjectsByStatus.ONGOING + labProjectsByStatus.ARCHIVED > 0
    ? Math.round((labProjectsByStatus.COMPLETED / (labProjectsByStatus.COMPLETED + labProjectsByStatus.ONGOING + labProjectsByStatus.ARCHIVED)) * 100)
    : 0

  return (
    <section className="rounded-(--ui-radius-lg) border border-(--ui-border) bg-white p-5 shadow-(--ui-shadow-md)">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--ui-muted)">Graph</p>
          <h2 className="mt-1 text-lg font-semibold text-(--ui-text)">Content Status Overview</h2>
          <p className="mt-1 text-sm text-(--ui-muted)">Daily content additions for the last {trendPoints.length} days</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">Blogs: {blogTotal}</span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700">Projects: {projectTotal}</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2.3fr_1fr]">
        <article className="rounded-(--ui-radius-lg) border border-(--ui-border) bg-(--ui-surface-muted) p-3">
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[680px]" role="img" aria-label="Blogs and projects created over time">
              {[0, 1, 2, 3, 4].map((tick) => {
                const y = padY + ((chartHeight - padY * 2) / 4) * tick
                return <line key={tick} x1={padX} y1={y} x2={chartWidth - padX} y2={y} stroke="rgba(100, 116, 139, 0.2)" strokeDasharray="4 4" />
              })}
              <path d={blogsPath} stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d={projectsPath} stroke="#8b5cf6" strokeWidth="3" fill="none" strokeLinecap="round" />

              {trendPoints.map((item, index) => {
                const plotWidth = chartWidth - padX * 2
                const step = trendPoints.length > 1 ? plotWidth / (trendPoints.length - 1) : 0
                const x = padX + index * step
                const yBlogs = padY + ((chartHeight - padY * 2) - (item.blogsCreated / maxValue) * (chartHeight - padY * 2))
                const yProjects = padY + ((chartHeight - padY * 2) - (item.projectsCreated / maxValue) * (chartHeight - padY * 2))

                return (
                  <g key={item.date || `${item.label}-${index}`}>
                    <circle cx={x} cy={yBlogs} r="3.5" fill="#0ea5e9" />
                    <circle cx={x} cy={yProjects} r="3.5" fill="#8b5cf6" />
                    {index % Math.ceil(trendPoints.length / 6) === 0 || index === trendPoints.length - 1 ? (
                      <text x={x} y={chartHeight - 6} textAnchor="middle" fill="#64748b" fontSize="11">{item.label}</text>
                    ) : null}
                  </g>
                )
              })}
            </svg>
          </div>
        </article>

        <aside className="grid gap-3">
          <article className="rounded-(--ui-radius-lg) border border-(--ui-border) bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--ui-muted)">Blog Quality</p>
            <p className="mt-2 text-2xl font-semibold text-(--ui-text)">{publishedShare}%</p>
            <p className="mt-1 text-sm text-(--ui-muted)">Published ratio</p>
          </article>
          <article className="rounded-(--ui-radius-lg) border border-(--ui-border) bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--ui-muted)">Project Quality</p>
            <p className="mt-2 text-2xl font-semibold text-(--ui-text)">{completedShare}%</p>
            <p className="mt-1 text-sm text-(--ui-muted)">Completed ratio</p>
          </article>
          <article className="rounded-(--ui-radius-lg) border border-(--ui-border) bg-white p-4 text-sm text-(--ui-muted)">
            <p className="font-medium text-(--ui-text)">Status Mix</p>
            <p className="mt-2">Blogs: {blogsByStatus.DRAFT} draft, {blogsByStatus.PUBLISHED} published, {blogsByStatus.ARCHIVED} archived</p>
            <p className="mt-1">Projects: {labProjectsByStatus.ONGOING} ongoing, {labProjectsByStatus.COMPLETED} completed, {labProjectsByStatus.ARCHIVED} archived</p>
          </article>
        </aside>
      </div>
    </section>
  )
}
