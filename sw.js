/* Ironwave service worker — exists only to receive push events and show a
   notification, and to focus/open the app when one is tapped. It doesn't
   cache anything or intercept normal page loads, so it can't make the app
   go stale or behave differently offline — it's additive, not a rewrite of
   how the page already works. */

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Ironwave', body: event.data ? event.data.text() : '' };
  }
  var title = data.title || 'Ironwave';
  var options = {
    body: data.body || '',
    icon: 'icon-512.png',
    badge: 'icon-512.png',
    tag: data.tag || 'ironwave-meal'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var scope = self.registration.scope;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if ('focus' in clientList[i]) return clientList[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(scope);
    })
  );
});
