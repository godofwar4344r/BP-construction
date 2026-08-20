/* sw.js — offline shell for Ek Sawal.

   The hills lose signal constantly. Once a citizen has opened this page it must
   keep working: the whole knowledge base is already on their phone.

   Strategy: STALE-WHILE-REVALIDATE, not plain cache-first.

   Cache-first alone would pin every phone to the version it first loaded. When
   the Revenue Department revises a fee, that correction must reach people —
   a citizen walking to the tehsil with a stale ₹40 in their hand is exactly
   the failure this project exists to prevent. So we serve the cached copy
   instantly (fast, works offline) and refresh it in the background for next
   time. Bump CACHE on any release that must land immediately.
*/

var CACHE = 'ek-sawal-v3';
var SHELL = [
  './', './index.html', './manifest.webmanifest',
  './assets/style.css', './assets/i18n.js', './assets/kb.js',
  './assets/regional.js', './assets/match.js', './assets/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(e.request).then(function (hit) {
        var fresh = fetch(e.request).then(function (res) {
          if (res && res.status === 200) cache.put(e.request, res.clone());
          return res;
        }).catch(function () {
          return hit || cache.match('./index.html');
        });
        /* Cached copy now; network copy replaces it for the next load. */
        return hit || fresh;
      });
    })
  );
});
