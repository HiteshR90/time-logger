"use client";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080", {
      auth: { token: getAccessToken() },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    s.auth = { token: getAccessToken() };
    s.connect();
  }
}

export function disconnectSocket() {
  socket?.disconnect();
}
