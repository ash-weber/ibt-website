import { createServer as createHttpServer, type Server as HttpServer } from "node:http";
import type { Express } from "express";
import { Server } from "socket.io";
import {
  SOCKET_CHANNELS,
  SOCKET_EVENTS,
  type SiteSettingsRealtimePayload,
} from "./socket.events";

let io: Server | null = null;

const serializeSiteSettingsPayload = (payload: any) => {
  const serialized = { ...payload };

  // Recursively find Dates and convert to ISO strings
  const serializeDates = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (obj[key] instanceof Date) {
        obj[key] = obj[key].toISOString();
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach(serializeDates);
      } else if (typeof obj[key] === 'object') {
        serializeDates(obj[key]);
      }
    }
  };

  serializeDates(serialized);

  // Fallback for updatedAt if it was already handled or missing
  if (serialized.updatedAt instanceof Date) {
    serialized.updatedAt = serialized.updatedAt.toISOString();
  }

  return serialized;
};

export const createAppServer = (app: Express) => createHttpServer(app);

export const initSocketServer = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.join(SOCKET_CHANNELS.SITE_SETTINGS);

    socket.emit(SOCKET_EVENTS.CONNECTION_READY, {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  return io;
};

export const emitSiteSettingsUpdated = (payload: SiteSettingsRealtimePayload) => {
  if (!io) {
    return;
  }

  io
    .to(SOCKET_CHANNELS.SITE_SETTINGS)
    .emit(SOCKET_EVENTS.SITE_SETTINGS_UPDATED, serializeSiteSettingsPayload(payload));
};

export const getSocketServer = () => io;
