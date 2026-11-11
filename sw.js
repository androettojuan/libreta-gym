// Keeps the app usable without signal at the gym.
// App files: network first (so updates arrive), but with weak signal the cached copy answers after
// a few seconds instead of leaving the screen blank. Fonts, the PDF reader and the Firebase
// libraries: cache first. Firebase sign-in and database traffic is never touched here
// (Firestore keeps its own copy of the data and syncs it when the signal comes back).
const CACHE = "libreta-gym-v17";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
// Loaded by index.html from other sites: saved at install so the app opens offline even if it was used only once.
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const LIBS = [FB + "firebase-app-compat.js", FB + "firebase-auth-compat.js", FB + "firebase-firestore-compat.js"];
const FONTS_CSS = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap";
const NET_WAIT = 3500; // ms before falling back to the cached app when the network is slow

// Best effort: a missing font or library must not stop the app from installing.
async function cacheExtras(c) {
  const put = async url => { try { const res = await fetch(new Request(url, { mode: "no-cors" })); if (res.ok || res.type === "opaque") await c.put(url, res); } catch (e) {} };
  await Promise.all(LIBS.map(put));
  try {
    const res = await fetch(FONTS_CSS);
    if (res.ok) {
      const css = await res.clone().text();
      await c.put(FONTS_CSS, res);
      const files = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]);
      await Promise.all(files.map(put));
    }
  } catch (e) {}
}

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).then(() => cacheExtras(c))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Tapping the "rest is over" notification brings the app back.
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if ("focus" in c) return c.focus();
    return self.clients.openWindow("./");
  }));
});

const fromCache = req => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === "navigate" ? caches.match("index.html") : undefined));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const cdn = /fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(url.hostname)
    || (url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/"));
  if (!sameOrigin && !cdn) return;

  if (sameOrigin) {
    // Network first; the download keeps going in the background so the next opening gets the update.
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => fromCache(req).then(r => { if (r && !done) { done = true; resolve(r); } return r; });
      const timer = setTimeout(fallback, NET_WAIT);
      net.then(res => { clearTimeout(timer); if (!done) { done = true; resolve(res); } })
        .catch(() => { clearTimeout(timer); fallback().then(r => { if (!done) { done = true; resolve(r || Response.error()); } }); });
    }));
  } else {
    e.respondWith(
      caches.match(req, { ignoreVary: true }).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
