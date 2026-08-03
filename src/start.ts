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

const fetchNativo: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  // Só reescreve o que é relativo; URL absoluta já sabe para onde vai.
  const alvo = url.startsWith("/") ? `${API_NATIVA}${url}` : url;
  return fetch(alvo, {
    ...init,
    // A sessão do Supabase vive em cookie. Sem isto o servidor não sabe quem
    // está chamando e trata todo mundo como visitante.
    credentials: "include",
  });
};

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  ...(API_NATIVA ? { serverFns: { fetch: fetchNativo } } : {}),
}));
