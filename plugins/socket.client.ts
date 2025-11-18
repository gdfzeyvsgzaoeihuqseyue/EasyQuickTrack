import { io, Socket } from 'socket.io-client';
console.log('Socket.IO plugin is loading...')

declare module '#app' {
  interface NuxtApp {
    $socket: Socket | null;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const baseAPI = config.public.pgsBaseAPI || ''

  // Ne pas initialiser le socket si l'URL n'est pas définie
  if (!baseAPI) {
    console.warn('⚠️ Socket URL non défini. Socket.IO désactivé.')
    nuxtApp.provide('socket', null);
    return;
  }

  const socketUrl = baseAPI.replace(/\/api\/v1\/?$/, '')

  const socket = io(socketUrl, {
    transports: ['websocket'],
    autoConnect: true,
    timeout: 5000,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 3,
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
