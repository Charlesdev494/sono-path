import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Endpoint do cron de notificações. Vive aqui, antes de delegar ao TanStack,
// porque é uma rota HTTP simples que precisa funcionar em qualquer alvo de
// deploy (Cloudflare hoje, Vercel amanhã) — e esta versão do Start não tem
// rotas de servidor baseadas em arquivo.
//
// Protegido por segredo no header: um agendador externo (Vercel Cron, GitHub
// Action, pg_cron) chama isto de tempos em tempos. Sem o segredo certo, 401.
async function tratarCron(request: Request): Promise<Response> {
  const { default: process } = await import("node:process");
  const segredoEsperado = process.env.CRON_SECRET;

  // Sem segredo configurado, o endpoint fica trancado — não é uma porta aberta
  // por padrão.
  if (!segredoEsperado) {
    return Response.json({ erro: "cron não configurado" }, { status: 503 });
  }
  const enviado =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-cron-secret");
  if (enviado !== segredoEsperado) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  const { rodarCronNotificacoes } = await import("./lib/push/cron.server");
  try {
    const resumo = await rodarCronNotificacoes();
    return Response.json({ ok: true, ...resumo });
  } catch (error) {
    console.error("[cron] falhou:", error);
    return Response.json({ erro: "falha ao processar" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// CORS para o app empacotado
// ---------------------------------------------------------------------------
// O app das lojas roda em capacitor://localhost e chama este servidor — outra
// origem. Sem os cabeçalhos abaixo o navegador embutido bloqueia a requisição
// ANTES de sair, e o efeito é traiçoeiro: a chamada falha sem chegar ao
// servidor, sem log e sem erro que explique. Foi o que fazia o painel de
// Integrações e o formulário de suporte não funcionarem dentro do app.
//
// Lista fixa, e não "*": com credenciais o curinga é proibido pela própria
// especificação, e abrir para qualquer origem deixaria qualquer site chamar
// estas funções com o cookie da pessoa.
const ORIGENS_DO_APP = new Set([
  "capacitor://localhost", // iOS
  "ionic://localhost", // iOS, esquema antigo
  "http://localhost", // Android
]);

// O cliente do TanStack manda x-tsr-serverFn em TODA chamada de server function,
// e esse nome não é da lista segura do CORS: se ele não estiver aqui, o
// navegador cancela a requisição no preflight e nada chega ao servidor. Foi o
// que deixava Integrações quebrada no app mesmo depois do CORS existir — a
// lista tinha só content-type e authorization.
//
// Echoamos o que o navegador pediu em vez de manter uma lista fixa, para que um
// header novo do framework não volte a derrubar tudo em silêncio.
const HEADERS_PADRAO = "content-type, authorization, x-tsr-serverfn, accept";

// O cliente decide como ler a resposta olhando estes dois. Numa resposta de
// outra origem, header não listado aqui simplesmente não existe para o
// JavaScript: sem isto o x-tss-serialized some, a desserialização é pulada e a
// tela recebe o formato cru do fio em vez do objeto.
const HEADERS_EXPOSTOS = "x-tss-serialized, x-tss-raw";

function cabecalhosCORS(origin: string, request?: Request) {
  return {
    "Access-Control-Allow-Origin": origin,
    // Necessário para o cookie de sessão e o header Authorization irem junto.
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      request?.headers.get("access-control-request-headers") ?? HEADERS_PADRAO,
    "Access-Control-Expose-Headers": HEADERS_EXPOSTOS,
    // Evita um preflight por chamada; o app faz várias em sequência.
    "Access-Control-Max-Age": "86400",
    // Sem isto, um cache intermediário pode servir a resposta de uma origem
    // para outra.
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const doApp = origin && ORIGENS_DO_APP.has(origin);

    // O preflight não chega a nenhum handler: precisa ser respondido aqui, ou
    // o navegador cancela a requisição de verdade que viria em seguida.
    if (doApp && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cabecalhosCORS(origin, request) });
    }

    if (url.pathname === "/api/cron/notificacoes") {
      return tratarCron(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizada = await normalizeCatastrophicSsrResponse(response);
      if (!doApp) return normalizada;

      // Response é imutável; recriamos com os cabeçalhos somados.
      const headers = new Headers(normalizada.headers);
      for (const [k, v] of Object.entries(cabecalhosCORS(origin))) headers.set(k, v);
      return new Response(normalizada.body, {
        status: normalizada.status,
        statusText: normalizada.statusText,
        headers,
      });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          ...(doApp ? cabecalhosCORS(origin) : {}),
        },
      });
    }
  },
};
