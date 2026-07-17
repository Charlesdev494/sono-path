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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname === "/api/cron/notificacoes") {
      return tratarCron(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
