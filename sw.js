const CACHE = "sg-1788641474";
const DOSYALAR = ["./", "./index.html", "./media.js", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DOSYALAR)));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* Önce ağ (güncel sürüm anında gelir), ağ yoksa önbellek (çevrimdışı çalışma) */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.ok) {
        const kopya = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopya));
      }
      return res;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))
    )
  );
});
