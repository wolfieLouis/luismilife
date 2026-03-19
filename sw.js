/* =============================================
   LuismiLife — sw.js
   Service Worker — PWA offline support
   ============================================= */

const CACHE_NAME = 'luismilife-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/js/app.js',
  '/js/db.js',
  '/js/spiritual.js',
  '/js/economic.js',
  '/js/academic.js',
  '/js/fitness.js',
  '/js/notes.js',
  '/js/goals.js',
  '/js/reminders.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

/* ---- INSTALAR — cachear todos los archivos ---- */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---- ACTIVAR — limpiar caches viejos ---- */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---- FETCH — Cache first, luego red ---- */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (e.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});