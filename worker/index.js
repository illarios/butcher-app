// Custom service worker additions — merged by next-pwa into the generated SW

// ── Push notifications ─────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:     data.body,
      icon:     data.icon    || '/icons/icon-192x192.png',
      badge:    data.badge   || '/icons/badge-72x72.png',
      data:     data.data    || { url: '/' },
      vibrate:  [200, 100, 200],
      tag:      'order-update',     // Replace previous notification of same type
      renotify: true,
    })
  )
})

// ── Notification click → open URL ─────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          if ('navigate' in client) client.navigate(url)
          return
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

// ── Offline fallback ───────────────────────────────────────────────────────────
// next-pwa handles this via runtimeCaching + fallbacks config, but we add
// a manual fetch listener to catch navigation requests when offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match('/offline') || caches.match('/')
    )
  )
})
