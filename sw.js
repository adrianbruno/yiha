const CACHE = 'yiha-v2';
const ASSETS = [
  './',
  './index.html',
  './registro.html',
  './panel.html',
  './puerta.html',
  './sorteo.html',
  './img/vic_senalando.png',
  './img/vic_sombrero.png',
  './img/vic_juntos_saludo.png',
  './img/vic_apoyado_valla.png',
  './img/vic_juntos_pulgar.png',
  './img/vic_juntos_highfive.png',
  './img/vic_bailando_juntos.png',
  './img/vic_bailando_juntos.png',
  './img/logo_negro.png',
  './img/logo_yiha_192.png',
  './img/logo_yiha_512.png',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).catch(function(err) {
      console.log('Cache parcial:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.includes('script.google.com') || url.includes('fonts.googleapis') || url.includes('fonts.gstatic')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var network = fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      });
      return cached || network;
    })
  );
});
