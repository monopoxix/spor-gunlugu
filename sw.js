const CACHE = "sg-1785012695";
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
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r =>
      r || fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const kopya = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, kopya));
        }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
