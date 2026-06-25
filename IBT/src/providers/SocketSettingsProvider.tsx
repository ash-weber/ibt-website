/**
 * Socket Settings Provider
 * Provides real-time site settings to the entire app
 * Handles connection lifecycle and broadcasts updates
 */

'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { useSocketSiteSettings } from '@/src/hooks/useSocketSiteSettings';
import { SiteSettingsRealtimePayload, SocketState } from '@/src/types/socket';

interface SocketSettingsContextType {
  settings: SiteSettingsRealtimePayload;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceEndTime: string | null;
  whatsappNumber: string | null;
  homeVideoUrl: string | null;
  homeVideoEnabled: boolean;
  socket: {
    connected: boolean;
    connecting: boolean;
    isReady: boolean;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
  isMaintenanceActive: boolean;
  maintenanceTimeRemaining: number | null;
}

const DEFAULT_SETTINGS: SiteSettingsRealtimePayload = {
  maintenanceMode: false,
  maintenanceMessage: null,
  maintenanceEndTime: null,
  whatsappNumber: null,
  homeVideoUrl: null,
  homeVideoEnabled: false,
  updatedAt: new Date().toISOString(),
};

const SocketSettingsContext = createContext<SocketSettingsContextType | undefined>(
  undefined,
);

export interface SocketSettingsProviderProps {
  children: ReactNode;
  initialSettings?: SiteSettingsRealtimePayload;
}

export const SocketSettingsProvider: React.FC<SocketSettingsProviderProps> = ({
  children,
  initialSettings = DEFAULT_SETTINGS,
}) => {
  const {
    settings,
    maintenanceMode,
    maintenanceMessage,
    maintenanceEndTime,
    whatsappNumber,
    homeVideoUrl,
    homeVideoEnabled,
    connected,
    connecting,
    isReady,
    loading,
    error,
  } = useSocketSiteSettings(initialSettings);

  const [maintenanceTimeRemaining, setMaintenanceTimeRemaining] = useState<
    number | null
  >(null);

  // Calculate remaining maintenance time
  useEffect(() => {
    if (!maintenanceMode || !maintenanceEndTime) {
      // Don't set state during condition check, just return early
      return;
    }

    const updateTimer = () => {
      const endTime = new Date(maintenanceEndTime).getTime();
      const now = new Date().getTime();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setMaintenanceTimeRemaining(null);
      } else {
        setMaintenanceTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [maintenanceMode, maintenanceEndTime]);

  // Reset timer when maintenance mode is disabled
  useEffect(() => {
    if (!maintenanceMode) {
      setMaintenanceTimeRemaining(null);
    }
  }, [maintenanceMode]);

  const isMaintenanceActive = maintenanceMode;

  const value: SocketSettingsContextType = {
    settings,
    maintenanceMode,
    maintenanceMessage,
    maintenanceEndTime,
    whatsappNumber: whatsappNumber ?? null,
    homeVideoUrl: settings.homeVideoUrl ?? null,
    homeVideoEnabled: settings.homeVideoEnabled ?? false,
    socket: {
      connected,
      connecting,
      isReady,
      error,
    },
    loading,
    error,
    isMaintenanceActive,
    maintenanceTimeRemaining,
  };

  return (
    <SocketSettingsContext.Provider value={value}>
      {children}
    </SocketSettingsContext.Provider>
  );
};

/**
 * Hook to use socket settings context
 */
export const useSocketSettings = (): SocketSettingsContextType => {
  const context = useContext(SocketSettingsContext);
  if (!context) {
    throw new Error(
      'useSocketSettings must be used within SocketSettingsProvider',
    );
  }
  return context;
};


