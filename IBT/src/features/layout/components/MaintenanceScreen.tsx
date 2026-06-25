'use client';

import React from 'react';
import { useSocketSettings } from '@/src/providers/SocketSettingsProvider';
import { formatDateTime, formatTimeRemaining } from '@/src/utils/maintenance';

export function MaintenanceScreen() {
  const {
    maintenanceMode,
    maintenanceMessage,
    maintenanceEndTime,
    maintenanceTimeRemaining,
    socket,
  } = useSocketSettings();

  if (!maintenanceMode) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-[#fff8f4] via-[#fffdfb] to-[#fff1eb] text-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-(--ui-primary)/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-(--ui-primary)/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full border border-(--ui-border) bg-white p-6 shadow-[0_18px_50px_rgba(140,28,28,0.08)]">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="h-12 w-auto object-contain animate-pulse"
            />
          </div>
        </div>

        <h1 className="mb-3 text-4xl font-bold text-(--ui-text)">Under Maintenance</h1>
        <p className="mb-8 text-lg text-(--ui-muted)">
          We&apos;re making improvements to serve you better.
        </p>

        {maintenanceMessage && (
          <div className="mb-8 rounded-2xl border border-(--ui-border) bg-white/85 p-4 shadow-[0_12px_35px_rgba(140,28,28,0.06)] backdrop-blur">
            <p className="text-(--ui-primary-strong)">{maintenanceMessage}</p>
          </div>
        )}



        {maintenanceTimeRemaining !== null && (
          <div className="mb-8 space-y-3 rounded-2xl border border-(--ui-border) bg-white/90 p-4 shadow-[0_12px_35px_rgba(140,28,28,0.06)] backdrop-blur">
            <div>
              <p className="text-sm text-(--ui-muted)">Expected to return in</p>
              <p className="text-2xl font-semibold text-(--ui-primary)">
                {formatTimeRemaining(maintenanceTimeRemaining)}
              </p>
            </div>

            {maintenanceEndTime && (
              <div className="border-t border-(--ui-border) pt-3">
                <p className="text-xs text-(--ui-muted)">
                  Estimated completion: {formatDateTime(maintenanceEndTime)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              socket.connected ? 'animate-pulse bg-emerald-500' : 'bg-slate-300'
            }`}
          />
          <span className="text-xs text-(--ui-muted)">
            {socket.connected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>

        <div className="mt-12 border-t border-(--ui-border) pt-6">
          <p className="text-sm text-(--ui-muted)">
            We appreciate your patience. Follow us for updates.
          </p>
        </div>
      </div>
    </div>
  );
}