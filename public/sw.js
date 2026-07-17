// Trocar o nome do cache faz o navegador instalar este SW e apagar os caches
// antigos no activate. É a única forma de curar quem ficou com módulos velhos
// presos do dev — o próprio código de correção não chegaria ao navegador
// enquanto o SW anterior estivesse servindo do cache.
const CACHE_NAME = "us360-v2";
const PRECACHE_ASSETS = [
  "/",
  "/home",
  "/atlas",
  "/quiz",
  "/caso",
  "/perfil",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Nunca tocar nas rotas internas do dev server. Guardar um módulo do Vite em
  // cache-first congela o código: o arquivo muda e o navegador segue servindo a
  // versão antiga, quebrando o app de um jeito que não parece cache. Estes
  // prefixos só existem em desenvolvimento, então ignorá-los não afeta produção.
  if (
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/node_modules/") ||
    url.searchParams.has("v") ||
    url.searchParams.has("t")
  ) {
    return;
  }

  // For navigation requests, try network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/"))),
    );
    return;
  }

  // For static assets, cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    }),
  );
});
