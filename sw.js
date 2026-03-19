const CACHE = 'luismilife-v1';
const ASSETS = [
  '/luismilife/',
  '/luismilife/index.html',
  '/luismilife/manifest.json',
  '/luismilife/css/base.css',
  '/luismilife/css/layout.css',
  '/luismilife/css/components.css',
  '/luismilife/js/db.js',
  '/luismilife/js/app.js',
  '/luismilife/js/spiritual.js',
  '/luismilife/js/economic.js',
  '/luismilife/js/academic.js',
  '/luismilife/js/fitness.js',
  '/luismilife/js/notes.js',
  '/luismilife/js/goals.js',
  '/luismilife/js/reminders.js',
  '/luismilife/icons/icon-192.png',
  '/luismilife/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(err => console.log('Cache parcial:', err)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase.co')) return;
  if (e.request.url.includes('jsdelivr.net')) return;
  if (e.request.url.includes('cdnjs.cloudflare.com')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
