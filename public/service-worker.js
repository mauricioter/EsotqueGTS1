const CACHE_NAME = 'gtsnet-mobile-v1';
const urlsToCache = [
  '/mobile',
  '/mobile/instalacoes',
  '/gtsnet-logo.png',
  '/offline.html'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Ignorar esquemas não HTTP/HTTPS (chrome-extension, etc)
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Não cachear POST, PUT, DELETE requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Não cachear requisições de autenticação
  if (event.request.url.includes('/api/auth/') || 
      event.request.url.includes('/api/equipamentos') ||
      event.request.url.includes('/api/mobile')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Só cachear respostas bem-sucedidas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          })
          .catch((err) => {
            // Silenciar erros de cache (ex: chrome-extension)
            console.log('Cache put error (ignorado):', err.message);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // If no cache, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background Sync for offline photo uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncPhotos());
  }
});

async function syncPhotos() {
  // TODO: Implement background sync for photos
  console.log('Syncing photos in background...');
}

// Push Notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/gtsnet-logo.png',
    badge: '/gtsnet-logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/mobile'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
