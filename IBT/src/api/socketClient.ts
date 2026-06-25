/**
 * Socket.IO Client Configuration
 * Follows admin/frontend patterns for consistency
 */

import io, { Socket } from 'socket.io-client';
import { SOCKET_CHANNELS, SOCKET_EVENTS, SiteSettingsRealtimePayload } from '@/src/types/socket';

let socketInstance: Socket | null = null;

/**
 * Get or create Socket.IO client instance
 */
export const getSocketClient = (): Socket => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  socketInstance = io(apiUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    autoConnect: true,
    ackTimeout: 60000,
    forceNew: false,
  });

  socketInstance.on('connect', () => {
    console.log('[Socket] Connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason: string) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socketInstance.on('error', (error: Error | string) => {
    console.error('[Socket] Error:', error);
  });

  socketInstance.on('reconnect_attempt', () => {
    console.log('[Socket] Reconnection attempt...');
  });

  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socketInstance?.connected ?? false;
};

export const getCurrentSocket = (): Socket | null => {
  return socketInstance;
};

export const subscribeSiteSettings = (
  callback: (payload: SiteSettingsRealtimePayload) => void,
): (() => void) => {
  const socket = getSocketClient();

  if (socket.connected) {
    socket.emit('join', { room: SOCKET_CHANNELS.SITE_SETTINGS });
  } else {
    socket.once('connect', () => {
      socket.emit('join', { room: SOCKET_CHANNELS.SITE_SETTINGS });
    });
  }

  socket.on(SOCKET_EVENTS.SITE_SETTINGS_UPDATED, callback);

  return () => {
    socket.off(SOCKET_EVENTS.SITE_SETTINGS_UPDATED, callback);
  };
};
