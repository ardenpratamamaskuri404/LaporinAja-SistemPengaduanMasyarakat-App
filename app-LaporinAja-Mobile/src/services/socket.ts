import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
