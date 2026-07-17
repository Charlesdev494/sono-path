// Service worker do US360.
//
// O que ele faz: o app abre instantaneamente e não mostra o dinossauro de
// "sem internet" quando a conexão cai.
//
// O que ele NÃO faz, e é importante ser honesto: o app não funciona offline
// de verdade. Quiz, casos, atlas e progresso vêm do Supabase, que é outra
// origem — o SW não intercepta essas chamadas (nem deveria: cachear resposta
// de API autenticada é como se vaza dado de um usuário para outro). Sem rede,
// o aluno vê o app abrir e as telas avisarem que não conseguiram carregar.
// Offline real exigiria sincronização local, que é outro projeto.

// Trocar o nome do cache faz o navegador instalar este SW e apagar os caches
// antigos no activate.
const CACHE_NAME = "us360-v4";

// Só o que é público e estável.
//
// A versão anterior fazia precache de /home, /quiz, /caso e /perfil — rotas
// que hoje exigem login. Como o precache roda na instalação (quando pode não
// haver sessão), ele guardava a tela de login com o endereço do app: offline,
// o aluno logado veria "entre na sua conta". Rota autenticada não entra aqui.
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // addAll é tudo-ou-nada: um 404 numa entrada aborta a instalação
      // inteira e o app fica sem SW nenhum. Individualmente, um arquivo que
      // falte custa só ele mesmo.
      .then((cache) =>
        Promise.all(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((e) => console.warn("[sw] não cacheou", url, e)),
          ),
        ),
      )
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

  // Só GET da nossa própria origem. As chamadas ao Supabase são cross-origin
  // e passam direto — de propósito: cachear resposta de API autenticada
  // arriscaria servir dado de um usuário para outro.
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

  // As funções de servidor do TanStack (_serverFn) executam lógica; cachear
  // resposta delas serviria resultado velho como se fosse novo.
  if (url.pathname.startsWith("/_serverFn/")) {
    return;
  }

  // Navegação: rede primeiro (o conteúdo precisa estar fresco), cache como
  // rede de segurança, e a página offline como último recurso.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ??
            (await caches.match("/offline.html")) ??
            new Response("Sem conexão", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }),
    );
    return;
  }

  // Assets estáticos: cache primeiro (são versionados no nome, então nunca
  // ficam velhos), rede quando não houver.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Só guarda respostas boas: cachear um 404 ou um erro de rede o
          // congelaria até a próxima troca de versão do cache.
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached ?? Response.error());
    }),
  );
});

// ---------------------------------------------------------------------------
// Notificações push
// ---------------------------------------------------------------------------

self.addEventListener("push", (event) => {
  // O payload vem do nosso servidor, mas nunca confie cegamente: um push
  // malformado que jogue exceção aqui faz o navegador mostrar uma notificação
  // genérica ("Este site foi atualizado em segundo plano") no lugar da nossa.
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {};
  }

  const titulo = dados.titulo || "US360";
  const opcoes = {
    body: dados.corpo || "",
    icon: "/icons/icon-192.png",
    // Ícone monocromático da barra de status no Android. Sem ele o sistema
    // mostra um quadrado cinza.
    badge: "/icons/badge-96.png",
    lang: "pt-BR",
    // A tag agrupa: uma notificação nova do mesmo tipo substitui a anterior
    // em vez de empilhar cinco lembretes iguais.
    tag: dados.tipo || "us360",
    renotify: Boolean(dados.tipo),
    data: { url: dados.url || "/home" },
    // Sem vibração agressiva: é um app de estudo, não um alarme.
    vibrate: [80, 40, 80],
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = event.notification.data?.url || "/home";

  event.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Se o app já está aberto, navegar a aba existente em vez de abrir uma
      // segunda — ninguém quer três cópias do app abertas.
      for (const janela of janelas) {
        if (new URL(janela.url).origin === self.location.origin) {
          await janela.focus();
          if ("navigate" in janela) await janela.navigate(destino);
          return;
        }
      }
      await self.clients.openWindow(destino);
    })(),
  );
});

// O serviço de push pode trocar o endereço de inscrição sozinho. Sem tratar
// isso, a pessoa simplesmente para de receber notificações e ninguém descobre
// por quê. Aqui reinscrevemos e avisamos o app para atualizar o servidor.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const inscricaoAntiga =
        event.oldSubscription || (await self.registration.pushManager.getSubscription());
      const chave = inscricaoAntiga?.options?.applicationServerKey;
      if (!chave) return;

      const nova = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chave,
      });

      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const janela of janelas) {
        janela.postMessage({
          tipo: "push:reinscrito",
          antiga: inscricaoAntiga?.endpoint ?? null,
          nova: nova.toJSON(),
        });
      }
    })(),
  );
});
