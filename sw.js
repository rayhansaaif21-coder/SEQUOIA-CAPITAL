const CACHE_NAME = 'sequoia-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Installation — mise en cache des assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(['/','index.html']))
      .then(() => self.skipWaiting())
  );
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network first, cache fallback
self.addEventListener('fetch', e => {
  // Ignorer les requêtes Supabase (toujours online)
  if(e.request.url.includes('supabase.co')) return;
  
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Mettre en cache la réponse fraîche
        if(response.ok && e.request.method === 'GET'){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
