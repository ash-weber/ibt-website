import { createContext, type ReactNode, useContext } from 'react'
import { useSocketSiteSettings } from '../hooks/useSocketSiteSettings'
import type { SiteSettingsConnectionState, SiteSettingsRealtimePayload } from '../types/socket'

type SocketSettingsContextValue = {
  settings: SiteSettingsRealtimePayload
  connection: SiteSettingsConnectionState
  isMaintenanceActive: boolean
  maintenanceCountdownText: string | null
}

const SocketSettingsContext = createContext<SocketSettingsContextValue | null>(null)

function formatCountdown(endTime: string | null) {
  if (!endTime) {
    return null
  }

  const end = new Date(endTime).getTime()
  if (Number.isNaN(end)) {
    return null
  }

  const remaining = Math.max(0, end - Date.now())
  if (remaining === 0) {
    return 'Ending soon'
  }

  const totalMinutes = Math.ceil(remaining / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m remaining` : `${hours}h remaining`
  }

  return `${minutes}m remaining`
}

export function SocketSettingsProvider({ children }: { children: ReactNode }) {
  const { settings, connection } = useSocketSiteSettings()

  return (
    <SocketSettingsContext.Provider
      value={{
        settings,
        connection,
        isMaintenanceActive: settings.maintenanceMode,
        maintenanceCountdownText: formatCountdown(settings.maintenanceEndTime),
      }}
    >
      {children}
    </SocketSettingsContext.Provider>
  )
}

export function useSocketSettings() {
  const context = useContext(SocketSettingsContext)

  if (!context) {
    throw new Error('useSocketSettings must be used within SocketSettingsProvider')
  }

  return context
}
