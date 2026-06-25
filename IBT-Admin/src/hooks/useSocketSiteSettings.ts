import { useEffect, useMemo, useState } from 'react'
import { getSettings } from '../api/settings'
import { connectSocket, subscribeToSiteSettings } from '../api/socketClient'
import { SETTINGS_KEYS, type SettingEntity } from '../types/settings'
import { type SiteSettingsConnectionState, type SiteSettingsRealtimePayload } from '../types/socket'

function toRealtimePayload(settings: SettingEntity[]): SiteSettingsRealtimePayload {
  const settingsMap = new Map(settings.map((item) => [item.key, item.value]))

  return {
    maintenanceMode: Boolean(settingsMap.get(SETTINGS_KEYS.MAINTENANCE_MODE) ?? false),
    maintenanceMessage:
      typeof settingsMap.get(SETTINGS_KEYS.MAINTENANCE_MESSAGE) === 'string'
        ? (settingsMap.get(SETTINGS_KEYS.MAINTENANCE_MESSAGE) as string)
        : null,
    maintenanceEndTime:
      typeof settingsMap.get(SETTINGS_KEYS.MAINTENANCE_END_TIME) === 'string'
        ? (settingsMap.get(SETTINGS_KEYS.MAINTENANCE_END_TIME) as string)
        : null,
    whatsappNumber:
      typeof settingsMap.get(SETTINGS_KEYS.WHATSAPP_NUMBER) === 'string'
        ? (settingsMap.get(SETTINGS_KEYS.WHATSAPP_NUMBER) as string)
        : null,
    updatedAt: null,
  }
}

export function useSocketSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsRealtimePayload>({
    maintenanceMode: false,
    maintenanceMessage: null,
    maintenanceEndTime: null,
    whatsappNumber: null,
    updatedAt: null,
  })
  const [connection, setConnection] = useState<SiteSettingsConnectionState>({
    status: 'connecting',
    connected: false,
    connecting: true,
    error: null,
    lastUpdateAt: null,
  })

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined

    const bootstrap = async () => {
      setConnection((current) => ({ ...current, status: 'connecting', connecting: true, error: null }))

      try {
        const initialSettings = await getSettings()

        if (active) {
          setSettings(toRealtimePayload(initialSettings))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load settings'
        setConnection((current) => ({
          ...current,
          error: message,
        }))
      }

      if (!active) {
        return
      }

      const socket = connectSocket()

      const handleConnect = () => {
        setConnection((current) => ({
          ...current,
          status: 'connected',
          connected: true,
          connecting: false,
          error: null,
        }))
      }

      const handleDisconnect = () => {
        setConnection((current) => ({
          ...current,
          status: 'disconnected',
          connected: false,
          connecting: false,
        }))
      }

      const handleConnectError = (error: Error) => {
        setConnection((current) => ({
          ...current,
          status: 'error',
          connected: false,
          connecting: false,
          error: error.message,
        }))
      }

      const handleSettingsUpdate = (payload: SiteSettingsRealtimePayload) => {
        setSettings(payload)
        setConnection((current) => ({
          ...current,
          lastUpdateAt: payload.updatedAt ?? new Date().toISOString(),
        }))
      }

      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      socket.on('connect_error', handleConnectError)

      unsubscribe = subscribeToSiteSettings(handleSettingsUpdate)

      setConnection((current) => ({
        ...current,
        status: socket.connected ? 'connected' : current.status,
        connected: socket.connected,
        connecting: !socket.connected,
      }))
    }

    void bootstrap()

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  return useMemo(
    () => ({
      settings,
      connection,
    }),
    [connection, settings],
  )
}
