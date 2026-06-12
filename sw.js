// Service Worker — Yiha! PWA
const CACHE = 'yiha-v1';
const ASSETS = [
  '/yiha/',
  '/yiha/index.html',
  '/yiha/registro.html',
  '/yiha/panel.html',
  '/yiha/puerta.html',
  '/yiha/sorteo.html',
  '/yiha/img/vic_senalando.png',
  '/yiha/img/vic_sombrero.png',
  '/yiha/img/vic_juntos_saludo.png',
  '/yiha/img/vic_apoyado_valla.png',
  '/yiha/img/vic_juntos_pulgar.png',
  '/yiha/img/vic_juntos_highfive.png',
  '/yiha/img/vic_bailando_juntos.png',
  '/yiha/img/logo_negro.png',
];

// Instalar y cachear assets estáticos
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejas
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Fetch: network first para API, cache first para assets
self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  
  // API de Google → siempre network
  if (url.includes('script.google.com') || url.includes('fonts.googleapis')) {
    e.respondWith(fetch(e.request).catch(function() { return new Response('', {status: 503}); }));
    return;
  }
  
  // Assets → cache first, luego network
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() { return cached || new Response('Sin conexión', {status: 503}); });
    })
  );
});
