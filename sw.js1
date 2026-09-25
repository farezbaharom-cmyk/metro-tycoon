/* Metro Tycoon KL — service worker.
   Laman (HTML): rangkaian dahulu, supaya kemas kini di GitHub terus sampai;
   jika tiada internet, salinan tersimpan digunakan.
   Fail lain (ikon, fon, skrip Firebase): salinan tersimpan dahulu, dan
   dikemas kini di latar belakang.
   Pangkalan data Firebase dan log masuk TIDAK disentuh — ia mesti sentiasa
   bercakap terus dengan pelayan.
   Tukar VERSI jika senarai fail teras berubah. */
const VERSI = 'mtkl-v4-tabs';
const TERAS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

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

const bolehSimpan = url =>
  url.origin === self.location.origin ||
  url.hostname === 'fonts.googleapis.com' ||
  url.hostname === 'fonts.gstatic.com' ||
  (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

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

  if (!bolehSimpan(url)) return;
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
