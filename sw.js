// sw.js — EqConvert Service Worker
// Strategy:
//   Static assets (HTML, CSS, JS, icons, fonts) → Cache-first, update in background
//   Firebase / CDN / API calls                  → Network-first, no caching

const CACHE_NAME   = 'eqconvert-v1';
const OFFLINE_URL  = '/index.html';

// Assets to pre-cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/app.html',
  '/history.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/converter.js',
  '/js/nav.js',
  '/js/storage.js',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/favicon.svg',
];

// Hostnames that should always go straight to the network
const NETWORK_ONLY_HOSTS = new Set([
  'www.gstatic.com',          // Firebase SDK
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'cdnjs.cloudflare.com',     // JSZip
  'fonts.googleapis.com',     // Google Fonts CSS
  'fonts.gstatic.com',        // Google Fonts files
]);

// ── Install ───────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate — purge old caches ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key  => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Non-GET requests — always pass through
  if (request.method !== 'GET') return;

  // Network-only hosts — Firebase, CDNs, fonts
  if (NETWORK_ONLY_HOSTS.has(url.hostname)) return;

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

async function staleWhileRevalidate(request) {
  const cache    = await caches.open(CACHE_NAME);
  const cached   = await cache.match(request);

  // Kick off a network fetch regardless
  const fetchPromise = fetch(request)
    .then(response => {
      // Only cache valid same-origin or CORS responses
      if (
        response &&
        response.status === 200 &&
        (response.type === 'basic' || response.type === 'cors')
      ) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null); // network failure — swallow, return cache below

  // Return cached version immediately if available; otherwise wait for network
  return cached || fetchPromise || caches.match(OFFLINE_URL);
}
