// ImmoNova Service Worker v2
var CACHE = 'immonova-v2';
var ASSETS = [
  '/mieter-portal.html',
  '/shared.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      // Add each asset individually so one failure doesn't break install
      return Promise.allSettled(ASSETS.map(function(url) { return c.add(url); }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Network-first for HTML/JS, cache-first for images/fonts
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);

  // Skip Firebase and external requests
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic') || url.hostname !== self.location.hostname) {
    return;
  }

  // Cache-first for static assets (images, fonts, icons)
  var isStatic = /\.(png|jpg|jpeg|gif|svg|woff2|woff|ico)$/.test(url.pathname);
  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request).then(function(res) {
          caches.open(CACHE).then(function(c) { c.put(e.request, res.clone()); });
          return res;
        });
      })
    );
    return;
  }

  // Network-first for HTML and JS (always fresh when online)
  e.respondWith(
    fetch(e.request).then(function(res) {
      caches.open(CACHE).then(function(c) { c.put(e.request, res.clone()); });
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

// Push notifications
self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err) {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'ImmoNova', {
      body: data.body || 'Neue Nachricht',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/mieter-portal.html' }
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/mieter-portal.html'));
});
