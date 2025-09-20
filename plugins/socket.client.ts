import { io, Socket } from 'socket.io-client';
console.log('Socket.IO plugin is loading...')

declare module '#app' {
  interface NuxtApp {
    $socket: Socket;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const baseAPI = config.public.pgsBaseAPI as string;
  const socketUrl = baseAPI.replace(/\/api\/v1\/?$/, '');
  const socket = io(socketUrl, {
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
  });

  socket.on('socialsContactsProgress', (message: any) => {
    console.log('Socials Contacts Progress:', message);
  });

  nuxtApp.provide('socket', socket);
});
