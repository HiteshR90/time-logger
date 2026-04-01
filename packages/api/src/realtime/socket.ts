import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AuthPayload } from "../middleware/auth";

let io: Server | null = null;

export function initSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as AuthPayload;
    socket.join(`org:${user.orgId}`);
    console.log(`Socket connected: ${user.userId} (org: ${user.orgId})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user.userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function emitToOrg(orgId: string, event: string, data: unknown) {
  if (io) {
    io.to(`org:${orgId}`).emit(event, data);
  }
}
