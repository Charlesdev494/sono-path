import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Dentro do app empacotado (Capacitor) a origem é capacitor://localhost, que
// não serve backend nenhum: uma chamada para "/_serverFn/..." morreria ali
// mesmo. VITE_NATIVE_API_URL só existe no build nativo (ver vite.config.ts) e
// aponta para a Vercel, que continua sendo o servidor de verdade.
//
// Só age no cliente — durante o SSR da web o Start chama as funções direto, sem
// passar por fetch. Por isso a web não é afetada: lá a variável é undefined e
// este wrapper vira o fetch normal.
const API_NATIVA = import.meta.env.VITE_NATIVE_API_URL as string | undefined;

const fetchNativo: typeof fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  // Só reescreve o que é relativo; URL absoluta já sabe para onde vai.
  const alvo = url.startsWith("/") ? `${API_NATIVA}${url}` : url;

  // A sessão vive em cookie, e cookie não atravessa de capacitor://localhost
  // para sono-path.vercel.app. Sem isto o servidor trata todo mundo como
  // visitante, e as telas de admin do app não abriam. O token vai no cabeçalho;
  // o servidor aceita as duas formas (ver lib/api/admin.server.ts).
  const headers = new Headers(init?.headers);
  try {
    const { getSupabaseBrowserClient } = await import("./lib/supabase/client");
    const { data } = await getSupabaseBrowserClient().auth.getSession();
    if (data.session?.access_token) {
      headers.set("Authorization", `Bearer ${data.session.access_token}`);
    }
  } catch {
    // Sem sessão a chamada segue como visitante — quem decide se isso basta é
    // a função do outro lado.
  }

  return fetch(alvo, { ...init, headers, credentials: "include" });
};

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  ...(API_NATIVA ? { serverFns: { fetch: fetchNativo } } : {}),
}));
