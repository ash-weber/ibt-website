import { FiAlertTriangle, FiWifi, FiWifiOff } from 'react-icons/fi'
import { cx } from '../utils/cx'
import { useSocketSettings } from '../providers/SocketSettingsProvider'

export function MaintenanceStatusBanner() {
  const { settings, connection, maintenanceCountdownText } = useSocketSettings()

  if (!settings.maintenanceMode) {
    return null
  }

  return (
    <div className="mx-4 mt-4 rounded-(--ui-radius-lg) border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-(--ui-shadow-md)">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-700">
            <FiAlertTriangle />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Maintenance mode is active</p>
              <span
                className={cx(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  connection.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700',
                )}
              >
                {connection.connected ? <FiWifi size={11} /> : <FiWifiOff size={11} />}
                {connection.connected ? 'Live sync on' : 'Reconnecting'}
              </span>
            </div>
            <p className="mt-1 text-sm text-amber-800">
              {settings.maintenanceMessage ?? 'The site is currently under maintenance.'}
            </p>
          </div>
        </div>

        <div className="text-sm text-amber-900 sm:text-right">
          <p className="font-medium">{maintenanceCountdownText ?? 'No end time set'}</p>
          {connection.lastUpdateAt ? (
            <p className="text-xs text-amber-700">
              Updated {new Date(connection.lastUpdateAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
