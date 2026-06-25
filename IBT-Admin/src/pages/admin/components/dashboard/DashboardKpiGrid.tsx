import type { ReactNode } from 'react'
import { FiBookOpen, FiBriefcase, FiFeather, FiFlag, FiLayers, FiUsers, FiZap } from 'react-icons/fi'

type DashboardKpiGridProps = {
  counts: {
    services: number
    blogs: number
    labProjects: number
    branches: number
    members: number
    clients: number
    partners: number
    partnerColleges: number
  }
  featured: {
    blogs: number
    labProjects: number
  }
}

type KpiCard = {
  label: string
  value: number
  helper: string
  icon: ReactNode
  tone: string
}

export function DashboardKpiGrid({ counts, featured }: DashboardKpiGridProps) {
  const peopleCount = counts.members + counts.clients + counts.partners + counts.partnerColleges

  const cards: KpiCard[] = [
    {
      label: 'Blogs',
      value: counts.blogs,
      helper: `${featured.blogs} featured`,
      icon: <FiFeather />,
      tone: 'text-sky-700 bg-sky-50 border-sky-100',
    },
    {
      label: 'Lab Projects',
      value: counts.labProjects,
      helper: `${featured.labProjects} featured`,
      icon: <FiZap />,
      tone: 'text-violet-700 bg-violet-50 border-violet-100',
    },
    {
      label: 'Services',
      value: counts.services,
      helper: 'Active service catalog',
      icon: <FiBriefcase />,
      tone: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      label: 'People',
      value: peopleCount,
      helper: `${counts.members} members • ${counts.clients + counts.partners + counts.partnerColleges} external`,
      icon: <FiUsers />,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Colleges',
      value: counts.partnerColleges,
      helper: 'Partner institutions',
      icon: <FiBookOpen />,
      tone: 'text-teal-700 bg-teal-50 border-teal-100',
    },
    {
      label: 'Team Size',
      value: counts.members,
      helper: 'Internal team members',
      icon: <FiLayers />,
      tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-100',
    },
    {
      label: 'Branch',
      value: counts.branches,
      helper: 'Active branch locations',
      icon: <FiFlag />,
      tone: 'text-indigo-700 bg-indigo-50 border-indigo-100',
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="group rounded-(--ui-radius-lg) border border-(--ui-border) bg-white p-4 shadow-(--ui-shadow-md) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--ui-muted)">{card.label}</p>
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${card.tone}`}>{card.icon}</span>
          </div>
          <p className="mt-3 text-2xl font-bold leading-none text-(--ui-text)">{card.value}</p>
          <p className="mt-2 text-sm text-(--ui-muted)">{card.helper}</p>
        </article>
      ))}
    </section>
  )
}
