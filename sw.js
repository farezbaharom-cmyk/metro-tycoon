/* Metro Tycoon KL — service worker.
   Fail laman sendiri (HTML, css/, js/, ikon): rangkaian dahulu, supaya kemas
   kini di GitHub terus sampai dan HTML tidak pernah bercampur dengan skrip
   versi lama. Jika tiada internet, salinan tersimpan digunakan.
   Fail luar (fon, skrip Firebase): salinan tersimpan dahulu, dan dikemas kini
   di latar belakang — ia jarang berubah.
   Pangkalan data Firebase dan log masuk TIDAK disentuh — ia mesti sentiasa
   bercakap terus dengan pelayan.
   Tukar VERSI jika senarai fail teras berubah (contohnya fail js/ baharu). */
const VERSI = 'mtkl-v16-gc-iframe';
const TERAS = [
  './', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'css/style.css',
  'js/cats.js', 'js/config.js', 'js/data.js', 'js/audio.js', 'js/rules.js',
  'js/bot.js', 'js/render.js', 'js/ui.js', 'js/online.js', 'js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(TERAS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const luarBolehSimpan = url =>
  url.hostname === 'fonts.googleapis.com' ||
  url.hostname === 'fonts.gstatic.com' ||
  (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Laman utama */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const salin = res.clone(); caches.open(VERSI).then(c => c.put('./', salin)); }
          return res;
        })
        .catch(() => caches.match('./', { ignoreSearch: true }).then(r => r || caches.match('index.html')))
    );
    return;
  }

  /* Fail sendiri: rangkaian dahulu, simpanan jika luar talian */
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const salin = res.clone(); caches.open(VERSI).then(c => c.put(req, salin)); }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  /* Fail luar: simpanan dahulu, kemas kini di latar belakang */
  if (!luarBolehSimpan(url)) return;
  e.respondWith(
    caches.open(VERSI).then(c =>
      c.match(req).then(simpan => {
        const baru = fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
          return res;
        }).catch(() => simpan);
        return simpan || baru;
      })
    )
  );
});
