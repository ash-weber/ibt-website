'use client';

import React from 'react';
import { useSocketSettings } from '@/src/providers/SocketSettingsProvider';
import { MaintenanceScreen } from './MaintenanceScreen';

type MaintenanceOverlayProps = {
  children: React.ReactNode;
};

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({ children }) => {
  const { maintenanceMode } = useSocketSettings();

  if (maintenanceMode) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
};

export default MaintenanceOverlay;