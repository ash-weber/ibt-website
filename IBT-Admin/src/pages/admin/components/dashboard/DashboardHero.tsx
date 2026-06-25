import { FiArrowUpRight, FiClock, FiDatabase } from 'react-icons/fi'
import { ActionButton } from '../../../../component'

type DashboardHeroProps = {
  serverTime: string
  dbConnected: boolean
  onOpenComponents: () => void
}

export function DashboardHero({ serverTime, dbConnected, onOpenComponents }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-[var(--ui-shadow-md)] md:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-12 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Admin Control Center</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">Operational Snapshot</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Live totals, status distribution, and latest team actions in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-cyan-700">
              <FiClock />
              {serverTime}
            </span>
            <span
              className={
                dbConnected
                  ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700'
              }
            >
              <FiDatabase />
              {dbConnected ? 'Database connected' : 'Database unreachable'}
            </span>
          </div>
        </div>

        <ActionButton intent="primary" rightIcon={<FiArrowUpRight />} onClick={onOpenComponents}>
          Open Components
        </ActionButton>
      </div>
    </section>
  )
}
