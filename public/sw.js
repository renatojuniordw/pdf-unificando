self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Este é um service worker básico para permitir a instalação do PWA.
  // Ele apenas repassa as requisições para a rede.
  event.respondWith(fetch(event.request));
});
