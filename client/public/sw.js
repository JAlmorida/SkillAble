const CACHE_NAME = 'skillable-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Cache different types of content
const CACHE_URLS = [
  '/',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache essential resources
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (event.request.url.includes('/api/')) {
    // API requests - Network first, cache fallback
    event.respondWith(networkFirstStrategy(event.request));
  } else if (event.request.url.includes('/course/')) {
    // Course content - Cache first, network fallback
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // Other requests - Stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
});

// Network First Strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE);
    }
    
    throw error;
  }
}

// Cache First Strategy (for course content)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(request, response));
      }
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE);
    }
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  
  return cachedResponse || networkResponsePromise;
}

// Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push message received:', event);
  
  let notificationData = {
    title: '📚 SKILLABLE',
    body: 'You have a new notification!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'skillable-notification',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'View Course'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});