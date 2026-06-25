export const SOCKET_CHANNELS = {
  SITE_SETTINGS: 'site-settings',
} as const

export const SOCKET_EVENTS = {
  CONNECTION_READY: 'connection:ready',
  SITE_SETTINGS_UPDATED: 'site-settings:updated',
} as const

export type SocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export type SiteSettingsRealtimePayload = {
  maintenanceMode: boolean
  maintenanceMessage: string | null
  maintenanceEndTime: string | null
  whatsappNumber: string | null
  updatedAt: string | null
}

export type SiteSettingsConnectionState = {
  status: SocketConnectionStatus
  connected: boolean
  connecting: boolean
  error: string | null
  lastUpdateAt: string | null
}
